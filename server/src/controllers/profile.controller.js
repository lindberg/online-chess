const express = require('express');
const model = require('../model.js');

const router = express.Router();

router.post('/removeSlot', (req, res) => {
  const slot = model.findSlot(req.body.name);

  if (slot.assistant_name !== req.session.userID) {
    res.sendStatus(409);
    console.log(`Slot ${req.body.name} not owned by ${req.session.userID}!`);
    return;
  }

  model.removeSlot(req.body.name);
  res.sendStatus(200);

  console.log(`Slot ${req.body.name} removed!`);
  model.emitListToAll();
});

router.post('/addSlot', (req, res) => {
  if (model.findSlot(req.body.name)) {
    res.status(409).json({ error: 'Slot name already exists!' });
    console.log(`Slot ${req.body.name} already exists!`);
    return;
  }

  model.addSlot(req.body.name, req.session.userID);
  const newSlot = model.findSlot(req.body.name);
  res.status(200).json({ slot: newSlot });

  console.log(`Slot ${req.body.name} added!`);
  model.emitListToAll();
});

module.exports = { router };
