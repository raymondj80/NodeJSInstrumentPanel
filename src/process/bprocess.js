const path = require("path");
const fs = require("fs");
const json2csv = require("json2csv").parse;

var { spawn } = require("child_process");
const Data = require("../datareadwrite/readwrite");
const Controller = require("./bcontroller.js");

var EventEmitter = require("events").EventEmitter;
var ee = new EventEmitter();

var data;
var controller;

module.exports = function (io) {
  data = new Data({ io, ee, path, fs, json2csv, spawn });
  controller = new Controller({ io, ee });
  controller.setIOListener();
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
  } else if (state === 2) {
    console.log("fetch script names");
    let script_names = await data.getFileNames("scripts");
    data.emitMessage("returned_script_names", script_names);
  } else if (state === 3) {
    console.log("getting script");
    filename = packet;
    let script = await data.getFileContent(filename, "scripts");
    data.emitMessage("returned_script", script);
  } else if (state === 4) {
    console.log("start script");
    filename = packet;
    let script = await data.getFileContent(filename, "scripts");
    data.runScript(script);
    data.emitMessage("start_script");
  } else if (state === 5) {
    console.log("recording");
    filename = packet;
    data.writeToCSV(filename, "csv");
  } else if (state === 6) {
    console.log("running script");
  } else if (state === 7) {
    console.log("stop recording");
  } else if (state === 8) {
    console.log("finished script");
  }

  data
    .fetchInstrumentData()
    .then(() => data.updateHeaders())
    .catch((error) => console.log(error));
}

function backgroundProcess(sample_rate) {
  controller
    .getState()
    .then((res) => backgroundLogic(res))
    .catch((err) => console.log(err));
  setTimeout(function () {
    backgroundProcess(sample_rate);
  }, sample_rate);
}

module.exports.backgroundProcess = backgroundProcess;
