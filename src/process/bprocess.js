const path = require("path");
const fs = require("fs");
const { parseAsync } = require("json2csv");
const csvtojson = require("csvtojson");

var { spawn } = require("child_process");
const Users = require("../models/User.js");
const Data = require("./datareadwrite/readwrite");
const Controller = require("./bcontroller.js");

var EventEmitter = require("events").EventEmitter;
var ee = new EventEmitter();

var data;
var controller;

module.exports = function (io) {
  data = new Data({ io, ee, path, fs, parseAsync, csvtojson, spawn, Users });
  controller = new Controller({ io, ee });
  controller.setIOListener();
};

async function backgroundLogic([state, packet]) {
  if (state === -1) {
    console.log("logged out");
    return;
  } else if (state === 0) {
    console.log("idle state");
  } else if (state === 1) {
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
    console.log("script recording");
    filename = packet;
    data.writeToCSV(filename, "csv");
  } else if (state === 6) {
    console.log("running script");
  } else if (state === 7) {
    console.log("stop recording");
  } else if (state === 8) {
    console.log("finished script");
  } else if (state === 9) {
    console.log("manual recording");
    filename = packet["name"];
    data.writeToCSV(filename, "csv");
  } else if (state === 10) {
    console.log("loading user session");
    data.loadOnLogin(packet);
  } else if (state === 11) {
    console.log("saving user session");
    data.saveOnLogout();
  } else if (state === 12) {
    console.log("deleting script");
    data.deleteScript(packet);
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
