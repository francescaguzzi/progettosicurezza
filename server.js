const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const crypto = require('crypto');
const { registerUser, getUser } = require('./userDb');
const { simpleHash, performZKPRounds, performFiatShamirRounds, n } = require('./zkp');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

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
  const user = getUser(username);
  if (!user) {
    return res.status(400).json({ error: 'Utente non trovato' });
  }

  const s = simpleHash(password);
  const protocolRounds = rounds || 5;
  const useFiatShamir = mode === 'fiat-shamir';

  const result = useFiatShamir
    ? performFiatShamirRounds(s, user.v, protocolRounds)
    : performZKPRounds(s, user.v, protocolRounds);

  const impostorProbability = Math.pow(0.5, result.steps.length);

  res.json({
    success: result.success,
    steps: result.steps,
    probability: impostorProbability,
    mode: useFiatShamir ? 'Fiat-Shamir' : 'Interattivo'
  });
});

app.listen(port, () => {
  console.log(`Server ZKP in ascolto su http://localhost:${port}`);
});
