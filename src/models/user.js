const mongoose = require("mongoose");
var crypto = require('crypto');

const userSchema = mongoose.Schema({
  name: {
    type : String,
    required : true
  },
  email: {
    type: String,
    required: true
  },
  hash: String,
  salt: String,
  settings: String,
  scripts: [[String]],
  groupkey: String,
});

// method to create salt and hash profile for password encryption
userSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`);
};

// method to check the entered password is correct or not
userSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(`hex`);
  return this.hash === hash;
};

const userData = module.exports = mongoose.model("USER-DATA", userSchema);
