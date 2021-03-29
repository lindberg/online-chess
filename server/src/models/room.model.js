const { Chess } = require('chess.js');
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
    this.chess = new Chess();
    this.chess.move({ from: 'e2', to: 'e4'});
    console.log("chess board:");
    console.log(this.chess.board());
  }

  getPublicData() {
    const publicData = {
      name: this.name,
      ownerName: this.ownerName,
      playerTwo: this.playerTwo,
      chess: this.chess.board(),
    };

    return publicData;
  }
}

module.exports = Room;
