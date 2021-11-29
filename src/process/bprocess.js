var path = require("path");
const { io } = require("socket.io-client");
const json2csv = require("json2csv").parse;
var { spawn } = require("child_process");
const Data = require("../datareadwrite/readwrite");
const Controller = require("./bcontroller.js");
const fs = require("fs");

var data;
var controller;

module.exports = function (io) {
  data = new Data({ io, path, fs, json2csv, spawn });
  controller = new Controller({ io });
  controller.setIOListener();
};

const getState = async () => {
  return 0;
};

async function backgroundLogic([state, packet]) {
  if (state === 0) {
    console.log("default state");
  }

  if (state === 1) {
    console.log("save script");
    filename = packet["name"];
    filedata = packet["data"];
    data.saveFile(filename, "scripts", filedata);
  }

  if (state === 2) {
    console.log("fetch script names");
    let script_names = await data.getFileNames("scripts");
    data.emitMessage("returned_script_names", script_names);
  }

  data
    .fetchInstrumentData()
    .then(() => data.updateHeaders())
    .catch((error) => console.log(error));
}

function backgroundProcess() {
  controller
    .getState()
    .then((res) => backgroundLogic(res))
    .catch((err) => console.log(err));
  setTimeout(function () {
    backgroundProcess();
  }, 1000);
}

module.exports.backgroundProcess = backgroundProcess;
