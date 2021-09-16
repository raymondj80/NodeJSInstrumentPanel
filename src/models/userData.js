const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, unique: true },
  firstname: String,
  lastname: String,
  password: String,
});

var User = mongoose.model("USER-DATA", userSchema);
module.exports = User;
