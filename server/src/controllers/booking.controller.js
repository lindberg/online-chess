const express = require('express');
const model = require('../model.js');

const router = express.Router();

/**
 * Fetch the list the currently active rooms
 * @returns {void}
 */
router.get('/roomList', (req, res) => {
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
  const room = model.findRoom(req.params.room);

  if (model.findUser(req.session.userID).currentRoom !== '') {
    return model.httpResponse(res, 404, 'User is already in a room.');
  }
  if (room === undefined) {
    return model.httpResponse(res, 404, `No room with ID: ${req.params.room}`);
  }

  if (room.ownerName !== req.session.userID) {
    room.playerTwo = req.session.userID;
    console.log("updated player two: " + room.playerTwo);
    console.log("player two: " + req.session.userID);
  }

  model.findUser(req.session.userID).setCurrentRoom(room.name);

  res.status(200).json({
    msg: `Successfully joined room: ${room.name}`,
  });

  model.emitListToAll();

  return 0;
});

module.exports = { router };
