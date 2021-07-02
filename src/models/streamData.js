const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const streamSchema = new Schema({
    temp: {
        type: [Number],
        required: false
    },
    field: {
        type: [Number],
        required: false
    },
    Vx: {
        type: [Number],
        required: false
    },
    Vy: {
        type: [Number],
        required: false
    },
    freq: {
        type: [Number],
        required: false
    },
    theta: {
        type: [Number],
        required: false
    },
}, {timestamps: true});

const StreamData = mongoose.model('STREAM-DATA', streamSchema);
module.exports = StreamData;