const express = require('express');
const model = require('../model.js');
const db = require('../database.js');

const router = express.Router();

/**
 * Fetch the list the currently active rooms
 * @returns {void}
 */
router.get('/roomList', (req, res) => {
  console.log('req.session.socketID222: ' + req.session.socketID);
  const rooms = model.getRooms();
  res.status(200).json({ list: rooms });
});

/**
 * Join the specific room.
 * This will allow the user-session to listen to and post messages in the given room.
 * @param {String} req.params.room - The id of the room you would like to join
 * @param {String} req.session.userID - A string that uniquely identifies the given user.
 * @returns {void}
 */
// Det här handlar om bokningsrummet sen (inte en chatt)
router.get('/room/:room/join', (req, res) => {
  console.log('room name: ' + req.params.room)
  const room = model.findRoom(req.params.room);
  const user = model.findUser(req.session.userID);

  if (user.currentRoom !== req.params.room && user.currentRoom !== '') {
    console.log(req.session.userID + ' access to ' + req.params.room + ' denied');
    return model.httpResponse(res, 404, 'User is already in a room.');
  }
  if (room === undefined) {
    console.log('room ' + req.params.room + ' does not exist');
    return model.httpResponse(res, 404, `No room with ID: ${req.params.room}`);
  }

  if (room.playerWhite !== req.session.userID) {
    room.playerBlack = req.session.userID;
    console.log("updated player two: " + room.playerBlack);
    console.log("player two: " + req.session.userID);
  }

  user.setCurrentRoom(room.name);

  model.httpResponse(res, 200, room.getPublicData());

  model.emitListToAll();

  return 0;
});

router.post('/room/:room/movepiece', (req, res) => {
  const room = model.findRoom(req.params.room);
  const user = model.findUser(req.session.userID);

  if (user.currentRoom !== req.params.room) {
    console.log(req.session.userID + ' access to ' + req.params.room + ' denied');
    return model.httpResponse(res, 404, 'User is already in a room.');
  }
  if (room === undefined) {
    console.log('room ' + req.params.room + ' does not exist');
    return model.httpResponse(res, 404, `No room with ID: ${req.params.room}`);
  }

  let move = null;
  if (room.chess.turn() === 'w' &&
      room.playerWhite === req.session.userID) {
    move = room.chess.move(req.body);

    if (room.playerBlack !== '') {
      model.findUser(room.playerBlack).socket.emit('gameData', room.getPublicData());
      console.log('sending data to black with socket: ' + model.findUser(room.playerBlack).socket);
    }
    console.log('test2');
  }
  else if (room.chess.turn() === 'b' &&
           room.playerBlack === req.session.userID) {
    move = room.chess.move(req.body);
    model.findUser(room.playerWhite).socket.emit('gameData', room.getPublicData());
    console.log('test3');
  }
  
  // Game over
  let winner = room.getWinner();
  if (winner !== 'none') {
    console.log('Game over... Updating current rooms.');
    model.findUser(room.playerBlack).currentRoom = '';
    model.findUser(room.playerWhite).currentRoom = '';

    if (winner === 'w') {
      model.findUser(room.playerWhite).addWin();
      model.findUser(room.playerBlack).addLoss();
    }
    else if (winner === 'b') {
      model.findUser(room.playerWhite).addLoss();
      model.findUser(room.playerBlack).addWin();
    }
    else if (winner === 'draw') {
      model.findUser(room.playerWhite).addDraw();
      model.findUser(room.playerBlack).addDraw();
    }

    let winnerName = 'draw';
    if (winner === 'w') winnerName = room.playerWhite;
    else if (winner === 'b') winnerName = room.playerBlack;
    db.run("INSERT INTO games (white, black, fen, winner) VALUES (?, ?, ?, ?)", room.playerWhite, room.playerBlack, room.chess.fen(), winnerName, (err) => {
      if (err) { throw new Error(err); }
    });
  }

  console.log(move);
  console.log(move);
  if (move !== null) {
    model.httpResponse(res, 200, room.getPublicData());
    console.log('sent data...');
    return;
  }

  return model.httpResponse(res, 404, 'Something went wrong.');

  // model.emitListToAll();
});

module.exports = { router };
