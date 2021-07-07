const {spawn} = require('child_process');

function getData() {
    var Data = null;
    return Promise.resolve().then(v => {
        const process = spawn('python', ['./python/script.py']);
        process.stdout.on('data', function (data) {
            jsonData = JSON.parse(data.toString());
        });
        try {
            Data = jsonData;
        } catch (error) {
            console.log("error");
        }
        return Data;
    });
};

// Export async function
module.exports.getData = getData;