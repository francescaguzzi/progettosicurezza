const { simpleHash, modSquare } = require('./zkp');

const users = {};  // username -> { v }

function registerUser(username, password) {
  if (users[username]) {
    return { error: 'Username già registrato' };
  }
  const s = simpleHash(password);
  const v = modSquare(s);
  users[username] = { v };
  return { success: true };
}

function getUser(username) {
  return users[username] || null;
}

module.exports = {
  registerUser,
  getUser
};
