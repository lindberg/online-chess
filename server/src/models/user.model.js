/**
 * @class User
 */
const db = require('../database.js');

class User {
  constructor(name, currentRoom = '') {
    this.socket = null;
    this.currentRoom = currentRoom;
    this.name = name;

    console.log('user name: ' + name);
  }

  setCurrentRoom(roomName) {
    this.currentRoom = roomName;
  
    db.run("UPDATE users SET currentRoom = ? WHERE name = ?", roomName, this.name, (err) => {
      if (err) { throw new Error(err); }
      console.log(`currentRoom for user ${this.name} updated to ${roomName}`)
    });
  }
}

module.exports = User;
