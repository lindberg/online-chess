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
      winner: this.getWinner(),
      gameStatus: this.getGameStatus(),
    };

    return publicData;
  }

  getWinner() {
    if (this.chess.game_over()) {
      if (this.chess.in_checkmate()) {
        if (this.chess.turn() === 'b') return 'w';
        else return 'b';
      }
      else {
        return 'draw';
      }
    }
    console.log('no winner yet');
    return 'none';
  }

  getGameStatus() {
    let winner = this.getWinner();
    if (winner === 'none') {
      if (this.chess.turn() === 'w') return "White to move...";
      else return "Black to move...";
    }
    else if (winner === 'draw') return "Game ended. Draw.";
    else if (winner === 'w') return "Game ended. White won.";
    else if (winner === 'b') return "Game ended. Black won.";
  }
}

module.exports = Room;
