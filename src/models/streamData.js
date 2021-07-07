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
    Vx1: {
        type: [Number],
        required: false
    },
    Vy1: {
        type: [Number],
        required: false
    },
    freq1: {
        type: [Number],
        required: false
    },
    Vx2: {
        type: [Number],
        required: false
    },
    Vy2: {
        type: [Number],
        required: false
    },
    freq2: {
        type: [Number],
        required: false
    },
    theta2: {
        type: [Number],
        required: false
    }, 

}, {timestamps: true});

const StreamData = mongoose.model('STREAM-DATA', streamSchema);
module.exports = StreamData;