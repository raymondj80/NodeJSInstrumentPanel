const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  Csvs: {
    type: [{
      name: String,
      csv: []
    }],
    required: false
  },
  Scripts: {
    type: [{
      name: String,
      script: String
    }],
    required: false
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;