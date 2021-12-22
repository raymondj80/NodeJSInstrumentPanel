
const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Control Panel Home Page
router.get('/home', ensureAuthenticated, (req, res) =>
  res.render('home', {
    user: req.user
  })
);

// Control Panel Home Page
router.get('/home1', ensureAuthenticated, (req, res) =>
  res.render('home1', {
    user: req.user
  })
);

module.exports = router;