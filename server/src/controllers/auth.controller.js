const express = require('express');
const model = require('../model.js');
const db = require('../database');
const bcrypt = require('bcrypt');

const router = express.Router();

/**
 * requireAuth is an endpoint guard for logged in users.
 * aka: A middle ware used to limit access to an endpoint to authenticated users
 * @param {Request} req
 * @param {String} req.session.userID - A string that uniquely identifies the given user.
 * @param {Response} res
 * @param {Function} next
 * @returns {void}
 */
const requireAuth = (req, res, next) => {
  const maybeUser = model.findUser(req.session.userID);

  // "auth" check
  if (maybeUser === undefined) {
    const msg = 'Unauthorized. Please make sure you are logged in before attempting this action again.';
    return model.httpResponse(res, 401, msg);
  }

  next();
  return 0;
};

/**
 * Tells the client if they are in an authenticated user-session.
 * @param {String} req.session.userID - A string that uniquely identifies the given user.
 * @returns {void}
 */
router.get('/isAuthenticated', (req, res) => {
  const maybeUser = model.findUser(req.session.userID);

  // const rooms = model.getAssistantRooms(req.session.userID);

  console.log("user: " + req.session.userID);
  db.get('SELECT * FROM users WHERE name = (?)', req.session.userID, (err, user) => {
    if (err) { throw new Error(err); }
    if (!user) {
      error = "Username incorrect";
      console.log('Username incorrect!');

      model.httpResponse(res, 401);
      console.log("TEST222: " + error);
      return;
    }

    const rooms = model.getRooms();

    model.httpResponse(res, 200, {
      isAuthenticated: maybeUser !== undefined,
      username: maybeUser !== undefined ? maybeUser.name : 'N/A',
      userWins: user.wins,
      userLosses: user.losses,
      userDraws: user.draws,
      list: rooms,
    });
  });

  console.log('Sending the thing');

  /*
  res.status(200).json({
    isAuthenticated: maybeUser !== undefined,
    username: maybeUser !== undefined ? maybeUser.name : 'N/A',
  });
  */
});

/**
 * Attempts to authenticate the user-session
 * @param {String} req.body.username - The username of the user attempting to authenticate
 * @param {String} req.session.userID - A string that uniquely identifies the given user.
 * @returns {void}
 */
router.post('/authenticate', (req, res) => {
  console.log('Processing api login request');
  console.log("Got password: " + req.body.password);
/*
  // fetch user and verify password
  db.get('SELECT * FROM users WHERE name = (?) AND password = (?)', req.body.username, req.body.password, (err, user) => {
    if (err) { throw new Error(err); }
    if (user === undefined) {
      model.httpResponse(res, 401);
      console.log('User not found!');
      return;
    }
    console.log(`found user ${user}`);

    model.addUser(req.body.username, req.session.socketID);

    // Update the userID of the currently active session
    // console.log(req.session);
    req.session.userID = req.body.username;
    req.session.save((error) => {
      if (error) console.error(error);
      else console.debug(`Saved userID: ${req.session.userID}`);
    });

    // TODO: Only send 200 when the login was successful
    model.httpResponse(res, 200);
  });
*/



  // fetch user and verify password
  let error = "Something went wrong";
  db.get('SELECT * FROM users WHERE name = (?)', req.body.username, (err, user) => {
    if (err) { throw new Error(err); }
    if (!user) {
      error = "Username incorrect";
      console.log('Username incorrect!');

      model.httpResponse(res, 401);
      console.log("TEST222: " + error);
      return;
    }

    console.log(`found user ${user}`);
    console.log('verifying pwd');

    // Load hash from your password DB.
    bcrypt.compare(req.body.password, user.password).then((result) => {
      if (result) {
        model.addUser(user.name, user.currentRoom, req.session.socketID);
        console.log('THE SOCKET ID: ' + req.session.socketID);

        // Update the userID of the currently active session
        // console.log(req.session);
        req.session.userID = req.body.username;
        req.session.save((error) => {
          if (error) console.error(error);
          else console.debug(`Saved userID: ${req.session.userID}`);
        });

        model.httpResponse(res, 200, {
          username: user.name,
          currentRoom: user.currentRoom,
        });
        console.log("TEST");
        return;
      }
      else {
        error = "Password incorrect";
        console.log('Password incorrect!');
        model.httpResponse(res, 401);
        console.log("TEST222: " + error);
        return;
      }
    });

  });
});

router.get('/logout', (req, res) => {
  model.removeUser(req.session.userID);
  model.httpResponse(res, 200);
});

router.post('/register', (req, res) => {
  console.log(req.body);
  const username = req.body.username;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  let error = "";

  // ensure password and username satisfy conditions
  console.log("Got password: " + password);
  if (password !== confirmPassword) {
    error = "Passwords don't match";
    model.httpResponse(res, 200, {
      error: error,
    });
    return;
  } else if (username.length < 3) {
    error = "Username must be at least three characters long";
    model.httpResponse(res, 200, {
      error: error,
    });
    return;
  } else if (password.length < 5) {
    error = "Password must be at least five characters long";
    model.httpResponse(res, 200, {
      error: error,
    });
    return;
  } else {
    // add new user if name is not already taken
    db.serialize(() => {
      db.all('SELECT * FROM users WHERE name = (?)', req.body.username, (err, users) => {
        if (err) { throw new Error(err); }
        let usernameTaken = false;
        users.forEach((user) => {
          if (user.name === username) usernameTaken = true;
        });
        if (usernameTaken) {
          error = "Username already taken";
        } else {
          const saltRounds = 10;
          bcrypt.genSalt(saltRounds, (_, salt) => {
            bcrypt.hash(password, salt, (__, hash) => {
              const statement = db.prepare('INSERT INTO users (name, password) VALUES (?, ?)');
              statement.run(username, hash);
              statement.finalize();
            });
          });
        }
      });
      
      model.httpResponse(res, 200, {
        error: error,
      });
    });
  }
  
});

module.exports = { router, requireAuth };
