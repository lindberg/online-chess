const path = require('path'); //  Helps resolve relative paths, into absolute baths, independent of operating system
const { Database } = require('sqlite3').verbose();

const databasePath = path.join(__dirname, '..', 'db.sqlite');
const db = new Database(databasePath);

db.serialize(() => {

  db.run('DROP TABLE IF EXISTS users');
  db.run('DROP TABLE IF EXISTS rooms');
  db.run('DROP TABLE IF EXISTS games');
  db.run('CREATE TABLE users(name TEXT PRIMARY KEY, password TEXT, wins INTEGER DEFAULT 0, losses INTEGER DEFAULT 0, draws INTEGER DEFAULT 0, currentRoom TEXT DEFAULT "")');
  db.run('CREATE TABLE rooms(name TEXT PRIMARY KEY)');
  db.run('CREATE TABLE games(id INTEGER PRIMARY KEY AUTOINCREMENT, white TEXT, black TEXT, fen TEXT, winner TEXT)');


  
  const statement = db.prepare('INSERT INTO users (name, password) VALUES (?, ?)');
  statement.run('cabab1', '$2b$10$RRHadrLDw59aUCsD45vN4.hWZnBg3O7BjQt1d2ftFR8NBeQeJIx2.');
  statement.run('adam', '$2b$10$HN1pAOfr72xS2ii6cWsdFOhK/X9WotWbB/L0wPJ8Hx3udBMi7r4ym');
  statement.run('user', '$2b$10$AWAU/9HaO288RwnECvd7f.MXSbFLnkdexw5wKqxUvcMG5dfM0t2U6');
  //statement.run('testuser', '123');
  statement.finalize();
  
});


module.exports = db;

console.log(module.exports);
