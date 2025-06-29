
const n = 2357; // numero primo pubblico

function mod(x, m = n) {
  return ((x % m) + m) % m;
}

function modSquare(x) {
  return mod(x * x);
}

function randomBit() {
  return Math.random() < 0.5 ? 0 : 1;
}

// Semplice hash per prototipo (trasforma password in numero mod n)
function simpleHash(password) {
  let h = 0;
  for (const c of password) {
    h = mod(h * 31 + c.charCodeAt(0));
  }
  return h;
}

// Esegue i round ZKP e ritorna i dettagli
function performZKPRounds(s, v, rounds = 5) {
  const steps = [];
  let success = true;

  for (let i = 0; i < rounds; i++) {
    const r = Math.floor(Math.random() * n);
    const x = modSquare(r);
    const e = randomBit();
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

module.exports = {
  n,
  mod,
  modSquare,
  randomBit,
  simpleHash,
  performZKPRounds
};
