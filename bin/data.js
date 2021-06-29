const {spawn} = require('child_process');
const { SSL_OP_EPHEMERAL_RSA } = require('constants');
const { json } = require('express');
const { waitForDebugger } = require('inspector');
const { PassThrough } = require('stream');
const logOutput = (name) => (data) => console.log(`[${name}] ${data}`);

function getTemp() {
    var tempData = null;
    return Promise.resolve().then(v => {
        const process = spawn('python', ['temp.py']);
        process.stdout.on('data', function (data) {
            jsonData = JSON.parse(data.toString());
        });
        try {
            tempData = jsonData;
        } catch (error) {
            console.log("error");
        }
        return tempData;
    });
};

// Export async function
module.exports.getTemp = getTemp;