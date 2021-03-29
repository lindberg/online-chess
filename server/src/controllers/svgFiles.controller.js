const express = require('express');

const router = express.Router();

router.get('*', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.sendFile(__dirname + '/svg_chess_pieces/' + req.path);
});

module.exports = { router };
