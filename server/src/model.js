const db = require('./database');
const Slot = require('./models/slot.model');
const User = require('./models/user.model');

/**
 * slots & users are effectively hash maps with the name of the entry serving as a unique key.
 */
let slots = {};
let users = {};

/**
 * unregisteredSockets is used as a temporary pool of sockets
 * that belonging to users who are yet to login.
 */
let nextUnregisteredSocketID = 0;
let unregisteredSockets = {};

// Will be initialized in the exports.init function
exports.io = undefined;

/**
 * Initialize the model
 * @param { { io: SocketIO.Server} } config - The configurations needed to initialize the model.
 * @returns {void}
 */
exports.init = ({ io }) => {
  exports.io = io;
};

exports.fetchFromDB = () => {
  console.log('Fetching from db');
  db.all('SELECT * FROM timeslots', [], (err, rows) => {
    if (err) { console.log(err.message); }
    rows.forEach((row) => {
      let status = 'available';
      if (row.booked_by !== '') {
        status = 'booked';
      }
      this.addSlot(row.name, row.assistant_name, row.booked_by, status);
    });
  });
};

/**
 * Add a socket.io socket to the pool of unregistered sockets
 * @param {SocketIO.Socket} socket - The socket.io socket to add to the pool.
 * @returns {Number} The ID of the socket in the pool of unregistered sockets.
 */
exports.addUnregisteredSocket = (socket) => {
  const socketID = nextUnregisteredSocketID;
  nextUnregisteredSocketID += 1;

  unregisteredSockets[socketID] = socket;
  return socketID;
};
const assignUnregisteredSocket = (socketID) => {
  const socket = unregisteredSockets[socketID];
  unregisteredSockets = Object.keys(unregisteredSockets)
    .filter((sockID) => sockID !== socketID)
    .reduce((res, sockID) => ({ ...res, [sockID]: unregisteredSockets[sockID] }), {});

  return socket;
};

/**
 * Add a message to a slot & push out the message to all connected clients
 * @param {String} slotName - The name of the slot to add the message to.
 * @param {String} message - The message to add.
 * @returns {void}
 */
/*
 exports.addMessage = (slotName, message) => {
  // exports.findSlot(slotName).addMessage(message);
  exports.findSlot(slotName).bookSlot(message);
  // exports.io.emit('msg', message);

  // const slots = this.getSlots();
  // exports.io.emit('msg', slots);
  this.emitListToAll();
  // res.status(200).json({ list: slots });

  console.log(slotName, message);
};
*/

exports.emitListToAll = () => {
  exports.io.emit('msg', this.getSlots());
};

/**
 * Creates a user with the given name.
 * @param {String} name - The name of the user.
 * @param {Number} socketID - An optional ID of a socket.io socket in the unregistered sockets pool.
 * @see model.addUnregisteredSocket
 * @returns {void}
 */
exports.addUser = (name, socketID = undefined) => {
  users[name] = new User(name);
  if (socketID !== undefined) {
    users[name].socket = assignUnregisteredSocket(socketID);
  }
};

/*
exports.removeUser = (name) => {
  if (users.hasOwnProperty(name)) {
    delete users[name];
    // console.log(`User ${name} logged out!`);
  } else {
    // console.log(`User ${name} is not logged in. Could not log out.`);
  }
};
*/

/**
 * Updated the socket associated with the user with the given name.
 * @param {String} name - The name of the user.
 * @param {SocketIO.Socket} socket - A socket.io socket.
 * @returns {void}
 */
exports.updateUserSocket = (name, socket) => {
  users[name].socket = socket;
};

/**
 * Returns the user object with the given name.
 * @param {String} name - The name of the user.
 * @returns {User}
 */
exports.findUser = (name) => users[name];

/**
 * Removes the slot object with the matching name.
 * @param {String} name - The name of the slot.
 * @returns {void}
 */

exports.removeUser = (name) => {
  users = Object.values(users)
    .filter((user) => user.name !== name)
    .reduce((res, user) => ({ ...res, [user.name]: user }), {});
};


/**
 * Creates a slot with the given name.
 * @param {String} name - The name of the slot.
 * @returns {void}
 */
exports.addSlot = (name, assistantName, booked_by = '', status = 'available') => {
  if (this.findSlot(name)) {
    return;
  }
  slots[name] = new Slot(name, assistantName, booked_by, status);

  db.get('SELECT name FROM timeslots WHERE name = (?)', name, (_err, row) => {
    if (row !== undefined) {
      return;
    }
    db.run('INSERT INTO timeslots (name, assistant_name, booked_by) VALUES(?, ?, ?)', name, assistantName, '', (err) => {
      if (err) { console.log(err.message); }
      console.log('Added timeslot to db');
    });
  });
};

/**
 * Returns the public data for all the Slots.
 * @returns {Object}
 */
exports.getSlots = () => {
  const slotData = [];

  /*
  for (const [, slot] of Object.entries(slots)) {
    slotData.push(slot.getPublicData());
  }
  */

  const entries = Object.entries(slots);

  entries.forEach((slot) => {
    slotData.push(slots[slot[0]].getPublicData());
  });


  return slotData;

  // Object.values(slots);
};

/**
 * Removes the slot object with the matching name.
 * @param {String} name - The name of the slot.
 * @returns {void}
 */
exports.removeSlot = (name) => {
  slots = Object.values(slots)
    .filter((slot) => slot.name !== name)
    .reduce((res, slot) => ({ ...res, [slot.name]: slot }), {});

  db.get('DELETE FROM timeslots WHERE name = (?)', name, (err) => {
    if (err) console.log(err.message);
  });
};

/**
 * Sends an HTTP response.
 * @param {String} res - response.
 * @param {String} code - status code.
 * @param {String} msg - explanatory message.
 * @param {String} body - message body.
 * @returns {void}
 */
exports.httpResponse = (res, code, body = {}) => {
  // body = { msg: body };

  res.status(code).json(body);
};

/**
 * Return the slot object with the matching name.
 * @param {String} name - The name of the slot.
 * @returns {Slot}
 */
exports.findSlot = (name) => slots[name];
