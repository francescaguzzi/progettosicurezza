const fs = require('fs');
const path = './users.json';
const { simpleHash, modSquare } = require('./zkp');

function loadUsers() {
  if (!fs.existsSync(path)) return {};
  return JSON.parse(fs.readFileSync(path));
}

function saveUsers(users) {
  fs.writeFileSync(path, JSON.stringify(users, null, 2));
}

let users = loadUsers();

function registerUser(username, password) {
  if (users[username]) {
    return { error: 'Username già registrato' };
  }
  const s = simpleHash(password);
  const v = modSquare(s);
  users[username] = { v };
  saveUsers(users);
  return { success: true };
}

function getUser(username) {
  return users[username] || null;
}

module.exports = { registerUser, getUser };