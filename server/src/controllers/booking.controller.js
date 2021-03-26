const express = require('express');
const model = require('../model.js');

const router = express.Router();

/**
 * Fetch the list the currently active slots
 * @returns {void}
 */
router.get('/slotList', (req, res) => {
  const slots = model.getSlots();
  res.status(200).json({ list: slots });
});

/**
 * Join the specific slot.
 * This will allow the user-session to listen to and post messages in the given slot.
 * @param {String} req.params.slot - The id of the slot you would like to join
 * @param {String} req.session.userID - A string that uniquely identifies the given user.
 * @returns {void}
 */
// Det här handlar om bokningsrummet sen (inte en chatt)
router.get('/slot/:slot/join', (req, res) => {
  const slot = model.findSlot(req.params.slot);

  if (slot === undefined) {
    return model.httpResponse(res, 404, `No slot with ID: ${req.params.slot}`);
  }

  if (slot.status === 'booked') {
    console.log('Slot is already booked!');
    return model.httpResponse(res, 409, 'Slot is already booked!');
  }
  if (slot.reservationID !== null) {
    console.log('Slot is already reserved!');
    return model.httpResponse(res, 409, 'Slot is already reserved!');
  }

  // const user = model.findUser(req.session.userID);

  // Join the right socket.io slot
  // user.currentSlot = slot.name;
  // user.socket.join(user.currentSlot);

  // Send join message
  // model.addMessage(user.currentSlot, `${user.name} joined the slot!`);

  // Make sure only the person who reserved can book the time
  const reservationID = parseFloat(Math.random());
  slot.reserveSlot(reservationID);

  res.status(200).json({
    // list: slot.messages,
    reservationID,
    msg: `Successfully joined slot: ${slot.name}`,
  });

  // Send http response
  /*
  res.status(200).json({
    list: slot.messages,
    msg: `Successfully joined slot: ${slot.name}`,
    href_messages: `/slot/${slot.name}`,
    href_send_message: `/slot/${slot.name}/message`,
  });
  */

  model.emitListToAll();

  const reservationTimeout = setTimeout(() => {
    if (reservationID !== slot.reservationID) return;
    if (slot.status !== 'reserved') return;

    slot.freeSlot();
    model.emitListToAll();
  }, 20000);

  slot.setReservationTimeout(reservationTimeout);
  return 0;
});

/**
 * Book the given slot.
 * @param {String} req.params.slot - The id of the slot you would like to join
 * @returns {void}
 */
router.post('/slot/:slot/book', (req, res) => {
  // const user = model.findUser(req.session.userID);
  /*
  if (user.currentSlot !== req.params.slot) {
    res.status(403).json({
      msg: 'You may only send messages in slots you are partaking in.',
      href_join: `/slot/${req.params.slot}/join`,
    });
    return;
  }
  */

  const slot = model.findSlot(req.params.slot);

  if (slot === undefined) {
    return model.httpResponse(res, 404, `No slot with ID: ${req.params.slot}`);
  }

  if (slot.status === 'booked') {
    console.log('Slot is already booked!');
    return model.httpResponse(res, 409, 'Slot is already booked!');
  }
  if (req.body.reservationID !== slot.reservationID) {
    console.log('Wrong reservation ID!');
    return model.httpResponse(res, 409, 'Wrong reservation ID!');
  }

  // model.addMessage(slot.name, `${user.name}: ${req.body.message}`);
  // model.addMessage(slot.name, `${req.body.message}`);
  slot.bookSlot(req.body.name);

  model.emitListToAll();

  console.log(slot.name, req.body.name);

  return model.httpResponse(res, 200);
});


router.post('/slot/:slot/cancelreservation', (req, res) => {
  const slot = model.findSlot(req.params.slot);

  if (req.body.reservationID !== slot.reservationID) {
    console.log('Wrong reservation ID! Could not cancel reservation!');
    return model.httpResponse(res, 401, 'Wrong reservation ID! Could not cancel reservation!');
  }

  slot.freeSlot();

  model.emitListToAll();

  console.log('Reservation canceled!');

  res.sendStatus(200);

  return 0;
});

module.exports = { router };
