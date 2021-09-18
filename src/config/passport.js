const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");

// Load User Model
const User = require("../models/user");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      // Match User
      User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            return done(null, false);
          }
          // Match password
          if (user.validPassword(password)) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        })
        .catch((err) => console.log(err));
    })
  );

  passport.serializeUser((id, done) => {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });
};
