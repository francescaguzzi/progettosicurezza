const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { registerUser, getUser } = require('./userDb');
const { simpleHash, performZKPRounds, performFiatShamirRounds, n } = require('./zkp');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const mode = process.env.MODE || 'interactive';

// Registrazione
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username e password richiesti' });
  }

  const result = registerUser(username, password);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ success: true });
});

// Login con ZKP
app.post('/login', (req, res) => {
  const { username, password, rounds } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username e password richiesti' });
  }

  if (rounds && (rounds < 1 || rounds > 20)) {
    return res.status(400).json({ error: 'Numero di rounds non valido (1-20)' });
  }

  const user = getUser(username);
  if (!user) {
    return res.status(400).json({ error: 'Utente non trovato' });
  }

  try {
    const s = simpleHash(password);
    const protocolRounds = Math.min(Math.max(rounds || 5, 1), 20); // Clamp 1-20
    const useFiatShamir = mode === 'fiat-shamir';

    const result = useFiatShamir
    ? performFiatShamirRounds(s, user.v, protocolRounds)
    : performZKPRounds(s, user.v, protocolRounds);

    res.json({
      success: result.success,
      steps: result.steps,
      probability: Math.pow(0.5, result.steps.filter(s => s.success).length),
      mode: useFiatShamir ? 'Fiat-Shamir' : 'Interattivo'
    });
    // probabilità di successo di un attacco:
    // 

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Errore durante il login' });
  }
});

app.listen(port, () => {
  console.log(`Server ZKP in ascolto su http://localhost:${port}`);
});
