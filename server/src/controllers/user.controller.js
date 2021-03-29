const express = require('express');
const db = require('../database.js');
const model = require('../model.js');

const router = express.Router();

router.post('/removeRoom', (req, res) => {
  const room = model.findRoom(req.body.name);

  if (room.ownerName !== req.session.userID) {
    res.sendStatus(409);
    console.log(`Room ${req.body.name} not owned by ${req.session.userID}!`);
    return;
  }

  model.removeRoom(req.body.name);
  res.sendStatus(200);

  console.log(`Room ${req.body.name} removed!`);
  model.emitListToAll();
});

router.post('/addRoom', (req, res) => {
  if (model.findUser(req.session.userID).currentRoom !== '') {
    return model.httpResponse(res, 404, 'User is already in a room.');
  }
  if (req.body.name.length < 3) {
    res.status(409).json({ error: 'Room name has to be at least 3 characters long!' });
  }
  if (model.findRoom(req.body.name)) {
    res.status(409).json({ error: 'Room name already exists!' });
    console.log(`Room ${req.body.name} already exists!`);
    return;
  }

  model.addRoom(req.body.name, req.session.userID);
  const newRoom = model.findRoom(req.body.name);
  res.status(200).json({ room: newRoom });

  model.findUser(req.session.userID).setCurrentRoom(req.body.name);

  console.log(`Room ${req.body.name} added!`);
  model.emitListToAll();
});

module.exports = { router };
