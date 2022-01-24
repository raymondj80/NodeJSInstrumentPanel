
const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Control Panel Home Page
router.get('/home', ensureAuthenticated, (req, res) =>
  res.render('home', {
    name: req.user.name,
    email: req.user.email,
    devKey: process.env.DEV_KEY,
    clientId: process.env.CLIENT_ID_AUTH,
    appId: process.env.APP_ID,
  })
);

// Google Drive Page
router.get('/gd', ensureAuthenticated, (req, res) => 
  res.render('googledrive', {
      name: req.user.name,
      email: req.user.email,
  })
);

// Graphs Page
router.get('/graphs', ensureAuthenticated, (req, res) => 
  res.render('graphs', {
      name: req.user.name,
      email: req.user.email,
  })
);

module.exports = router;