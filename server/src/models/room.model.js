const { Chess } = require('chess.js');
const db = require('../database');
const model = require('../model.js');

/**
 * @class Room
 */
class Room {
  constructor(name, playerWhite) {
    // Public data
    this.name = name;
    this.playerWhite = playerWhite;
    this.playerBlack = '';
    this.chess = new Chess();
    // this.chess.move({ from: 'e2', to: 'e4'});
    console.log("chess board:");
    console.log(this.chess.board());
  }

  getPublicData() {
    const publicData = {
      name: this.name,
      playerWhite: this.playerWhite,
      playerBlack: this.playerBlack,
      board: this.chess.board(),
      turn: this.chess.turn(),
    };

    return publicData;
  }
}

module.exports = Room;
