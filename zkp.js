const crypto = require('crypto');
const n = 2357; // numero primo pubblico


function simpleHash(password) {
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  return parseInt(hash.slice(0, 8), 16) % n; // Prendi i primi 8 caratteri per un numero più grande
}

// funzione di quadrato modulare 
function modSquare(x) {
  return mod(x * x);
}

function mod(x, m = n) {
  x = BigInt(x);
  m = BigInt(m);
  return Number((x % m + m) % m);
}

function randomBit() {
  return Math.random() < 0.5 ? 0 : 1;
}

function hashToBit(input) {
  const hash = crypto.createHash('sha256').update(input.toString()).digest('hex');
  return parseInt(hash.slice(0, 2), 16) % 2;
}

// Semplice hash per prototipo (trasforma password in numero mod n)
/* function simpleHash(password) {
  let h = 0;
  for (const c of password) {
    h = mod(h * 31 + c.charCodeAt(0));
  }
  return h;
} */

// Esegue i round zero knowledge proof e ritorna i dettagli
function performZKPRounds(s, v, rounds = 5) {
  const steps = [];
  let success = true;

  for (let i = 0; i < rounds; i++) {
    const r = Math.floor(Math.random() * n);
    const x = modSquare(r);
    const e = randomBit(); // Generato dal Verifier in modo imprevedibile
    // Un attaccante attivo non può prevedere e quindi non può preparare x appropriato
    const y = e === 0 ? r : mod(r * s);
    const left = modSquare(y);
    const right = mod(x * (e === 0 ? 1 : v));

    const roundSuccess = (left === right);
    if (!roundSuccess) success = false;

    steps.push({
      round: i + 1,
      r, x, e, y, left, right, success: roundSuccess
    });

    if (!success) break;
  }

  return { success, steps };
}

// trasformazione fiat-shamir
function performFiatShamirRounds(s, v, rounds = 5) {
  const steps = [];
  let success = true;
  for (let i = 0; i < rounds; i++) {
    const r = Math.floor(Math.random() * n);
    const x = modSquare(r);
    const e = hashToBit(x); // Deterministico ma non influenzabile...
    // ...a meno che l'attaccante non trovi collisioni hash o controlli x
    const y = e === 0 ? r : mod(r * s);
    // Un osservatore vede solo (x, y) ma non può ricavare s
    const left = modSquare(y);
    const right = mod(x * (e === 0 ? 1 : v));
    const roundSuccess = (left === right);
    if (!roundSuccess) success = false;
    steps.push({ round: i + 1, r, x, e, y, left, right, success: roundSuccess });
    if (!success) break;
  }
  return { success, steps };
}


module.exports = {
  n,
  mod,
  modSquare,
  simpleHash,
  performZKPRounds,
  performFiatShamirRounds
};
