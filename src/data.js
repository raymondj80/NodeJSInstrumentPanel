const { spawn } = require("child_process");
var command_state = null;

function getData() {
  var Data = null;
  return Promise.resolve().then((v) => {
    const process = spawn("python", ["./python/fetch_data.py"]);
    process.stdout.on("data", function (data) {
      jsonData = JSON.parse(data.toString());
    });
    try {
      Data = jsonData;
    } catch (error) {
      // console.log("error");
    }
    return Data;
  });
}

function sendCommands(script) {
  const process = spawn("python", ["-u", "./python/run_script.py", script]);
  process.stdout.on("data", function (data) {
    command_state = JSON.parse(data.toString());
  });
}

function getCommandState() {
  return command_state;
}

function resetCommandState() {
  command_state = null;
}

module.exports.getData = getData;
module.exports.sendCommands = sendCommands;
module.exports.getCommandState = getCommandState;
module.exports.resetCommandState = resetCommandState;
