const { spawn } = require("child_process");

function getData() {
  var Data = null;
  return Promise.resolve().then((v) => {
    const process = spawn("python", ["./python/script2.py"]);
    process.stdout.on("data", function (data) {
      jsonData = JSON.parse(data.toString());
    });
    try {
      Data = jsonData;
    } catch (error) {
      console.log("error");
    }
    return Data;
  });
}

function getData2(arg1, arg2) {
  var Data = null;
  return Promise.resolve().then((v) => {
    const process = spawn("python", ["./python/test_script.py", arg1, arg2]);
    process.stdout.on("data", function (data) {
      jsonData = JSON.parse(data.toString());
    });
    try {
      Data = jsonData;
    } catch (error) {
      console.log("error");
    }
    return Data;
  });
}

// Export async function
module.exports.getData = getData;
module.exports.getData2 = getData2;
