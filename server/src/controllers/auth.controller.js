const express = require('express');
const model = require('../model.js');
const db = require('../database');

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

  const slots = model.getSlots();
  // const slots = model.getAssistantSlots(req.session.userID);

  model.httpResponse(res, 200, {
    isAuthenticated: maybeUser !== undefined,
    username: maybeUser !== undefined ? maybeUser.name : 'N/A',
    list: slots,
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

  // fetch user and verify password
  db.get('SELECT * FROM admins WHERE name = (?) AND password = (?)', req.body.username, req.body.password, (err, user) => {
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
});

router.get('/logout', (req, res) => {
  model.removeUser(req.session.userID);
  model.httpResponse(res, 200);
});

// TODO: Add 'create account' route.
// The 'authenticate' route is only supposed to check if the user can login.

module.exports = { router, requireAuth };
