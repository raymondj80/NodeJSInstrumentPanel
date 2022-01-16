
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
  })
);

// Google Drive Page
router.get('/gd', ensureAuthenticated, (req, res) => 
  res.render('googledrive', {
      name: req.user.name,
      email: req.user.email,
  })
);

// // Control Panel Home Page
// router.get('/home1', ensureAuthenticated, (req, res) =>
//   res.render('home1', {
//     name: req.user.name,
//     email: req.user.email
//   })
// );

module.exports = router;