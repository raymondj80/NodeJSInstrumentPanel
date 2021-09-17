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
      // console.log("error");
    }
    return Data;
  });
}

function getData2(arg) {
  var Data = null;
  return Promise.resolve().then((v) => {
    const process = spawn("python", ["./python/script2.py", arg]);
    process.stdout.on("data", function (data) {
      jsonData = JSON.parse(data.toString());
    });
    try {
      Data = jsonData;
    } catch (error) {}
    return Data;
  });
}

getData2([{ Order: "ramp_to_temperature" }]);
// Export async function
module.exports.getData = getData;
module.exports.getData2 = getData2;
