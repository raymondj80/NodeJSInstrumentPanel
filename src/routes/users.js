const express = require('express');
const router = express.Router();
const passport = require('passport');
const path = require('path');

// User model
const User = require('../models/user')

// Login Page
router.get('/login', (req, res) => res.sendFile(path.join(__dirname,"../views/login.html")));

// Register Page
router.get('/register', (req, res) => res.sendFile(path.join(__dirname,"../views/register.html")));

// Register Handle
router.post('/register', async (req, res) => {
	var newUser = new User({
        email: req.body.email,
        name: req.body.name,
        groupkey: req.body.groupkey
    });
    newUser.setPassword(req.body.password);
    await newUser
        .save()
        .then(() => {
            var redir = { redirect: '/login' };
            return res.json(redir);
        })
        .catch(err => {
            console.log("error is ", err.message);
            var redir = { redirect: '/error' };
            return res.json(redir);
        })

});

// Login Handle
router.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/home',
		failureRedirect: '/users/login',
	})(req, res, next);
});

module.exports = router;