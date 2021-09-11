const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const groupSchema = new Schema({
    groupkey: String,
    groupscripts: [[String]],
    groupfiles: [[String]],
})