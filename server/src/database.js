const path = require('path'); //  Helps resolve relative paths, into absolute baths, independent of operating system
const { Database } = require('sqlite3').verbose();

const databasePath = path.join(__dirname, '..', 'db.sqlite');
const db = new Database(databasePath);
/*
db.serialize(() => {

  db.run('DROP TABLE IF EXISTS admins');
  db.run('DROP TABLE IF EXISTS timeslots');
  db.run('CREATE TABLE admins(name TEXT PRIMARY KEY, password TEXT)');
  db.run('CREATE TABLE timeslots(name TEXT PRIMARY KEY, assistant_name TEXT, booked_by TEXT)');


  const statement = db.prepare('INSERT INTO admins (name, password) VALUES (?, ?)');
  statement.run('admin', 'admin');
  statement.run('asse', '123');
  statement.finalize();
});
*/

module.exports = db;

console.log(module.exports);
