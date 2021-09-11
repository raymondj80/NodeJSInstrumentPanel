const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: String,
  firstname: String,
  lastname: String,
  password: String,
  groupkey: String,
  settings: String,
  scripts: [[String]],
  groupkey: String,
});

const userData = mongoose.model("USER-DATA", userSchema);
module.exports = userData;
