const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const streamSchema = new Schema(
  {
    record_data: [
      {
        temp: Number,
        temp_state: String,
        field: Number,
        field_state: String,
        Vx1: Number,
        Vy1: Number,
        freq1: Number,
        theta1: Number,
        Vx2: Number,
        Vy2: Number,
        freq2: Number,
        theta2: Number,
        time: Number,
      },
    ],
  },
  { timestamps: true }
);

const StreamData = mongoose.model("STREAM-DATA", streamSchema);
module.exports = StreamData;
