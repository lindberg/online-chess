const db = require('./database');
const Room = require('./models/room.model');
const User = require('./models/user.model');

/**
 * rooms & users are effectively hash maps with the name of the entry serving as a unique key.
 */
let rooms = {};
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
  db.all('SELECT * FROM rooms', [], (err, rows) => {
    if (err) { console.log(err.message); }
    rows.forEach((row) => {
      let status = 'available';
      if (row.booked_by !== '') {
        status = 'booked';
      }
      this.addRoom(row.name);
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
 * Add a message to a room & push out the message to all connected clients
 * @param {String} roomName - The name of the room to add the message to.
 * @param {String} message - The message to add.
 * @returns {void}
 */
/*
 exports.addMessage = (roomName, message) => {
  // exports.findRoom(roomName).addMessage(message);
  exports.findRoom(roomName).bookRoom(message);
  // exports.io.emit('msg', message);

  // const rooms = this.getRooms();
  // exports.io.emit('msg', rooms);
  this.emitListToAll();
  // res.status(200).json({ list: rooms });

  console.log(roomName, message);
};
*/

exports.emitListToAll = () => {
  exports.io.emit('msg', this.getRooms());
};

/**
 * Creates a user with the given name.
 * @param {String} name - The name of the user.
 * @param {Number} socketID - An optional ID of a socket.io socket in the unregistered sockets pool.
 * @see model.addUnregisteredSocket
 * @returns {void}
 */
exports.addUser = (name, currentRoom, socketID) => {
  users[name] = new User(name, currentRoom);
  users[name].socket = assignUnregisteredSocket(socketID);
  console.log('socket: ' + socketID);
  console.log('socket: ' + users[name].socket);
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
 * Removes the room object with the matching name.
 * @param {String} name - The name of the room.
 * @returns {void}
 */

exports.removeUser = (name) => {
  users = Object.values(users)
    .filter((user) => user.name !== name)
    .reduce((res, user) => ({ ...res, [user.name]: user }), {});
};


/**
 * Creates a room with the given name.
 * @param {String} name - The name of the room.
 * @returns {void}
 */
exports.addRoom = (name) => {
  if (this.findRoom(name)) {
    return;
  }
  rooms[name] = new Room(name);

  db.get('SELECT name FROM rooms WHERE name = (?)', name, (_err, row) => {
    if (row !== undefined) {
      return;
    }
    db.run('INSERT INTO rooms (name) VALUES(?)', name, (err) => {
      if (err) { console.log(err.message); }
      console.log('Added timeroom to db');
    });
  });
};

/**
 * Returns the public data for all the Rooms.
 * @returns {Object}
 */
exports.getRooms = () => {
  const roomData = [];

  /*
  for (const [, room] of Object.entries(rooms)) {
    roomData.push(room.getPublicData());
  }
  */

  const entries = Object.entries(rooms);

  entries.forEach((room) => {
    if (!rooms[room[0]].playerTwo) {
      roomData.push(rooms[room[0]].getPublicData());
    }
  });


  return roomData;

  // Object.values(rooms);
};

/**
 * Removes the room object with the matching name.
 * @param {String} name - The name of the room.
 * @returns {void}
 */
exports.removeRoom = (name) => {
  rooms = Object.values(rooms)
    .filter((room) => room.name !== name)
    .reduce((res, room) => ({ ...res, [room.name]: room }), {});

  db.get('DELETE FROM rooms WHERE name = (?)', name, (err) => {
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
 * Return the room object with the matching name.
 * @param {String} name - The name of the room.
 * @returns {Room}
 */
exports.findRoom = (name) => rooms[name];
