const db = require('../database');

/**
 * @class Room
 */
class Room {
  constructor(name, ownerName) {
    // Public data
    this.name = name;
    this.ownerName = ownerName;
    this.playerTwo = null;
  }

  getPublicData() {
    const publicData = {
      name: this.name,
      ownerName: this.ownerName,
      playerTwo: this.playerTwo,
    };

    return publicData;
  }
}

module.exports = Room;
