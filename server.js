const express = require('express');
const bodyParser = require('body-parser');
const { registerUser, getUser } = require('./userDb');
const { simpleHash, performZKPRounds } = require('./zkp');

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
  const result = performZKPRounds(s, user.v, rounds || 5);
  if (result.success) {
    res.json({ success: true, steps: result.steps });
  } else {
    res.json({ success: false, steps: result.steps });
  }
});

app.listen(port, () => {
  console.log(`Server ZKP in ascolto su http://localhost:${port}`);
});
