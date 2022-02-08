const path = require("path");
const fs = require("fs");
const { Parser } = require("json2csv");
const csvtojson = require("csvtojson");
const { google } = require("googleapis");
var { spawn } = require("child_process");
const Users = require("../models/User.js");
const DataReadWrite = require("./datareadwrite/readwrite");
const Controller = require("./bcontroller.js");

var EventEmitter = require("events").EventEmitter;
var ee = new EventEmitter();

var data;
var controller;

module.exports = function (io) {
  data = new DataReadWrite({
    io,
    ee,
    path,
    fs,
    Parser,
    csvtojson,
    spawn,
    Users,
    google,
  });
  controller = new Controller({ io, ee });
  controller.setIOListener();
};

async function backgroundLogic([state, packet]) {
  if (state === -1) {
    console.log("logged out");
    return;
  } else if (state === 0) {
    data.updateStreamData();
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
    data.resetDatapacket("record");
    data.setTime(0);
    data.emitMessage("start_script");
  } else if (state === 5) {
    console.log("script recording");
    filename = packet;
    data.updateRecordData();
    data.writeToCSV(filename, "csv");
  } else if (state === 6) {
    console.log("running script");
    data.updateStreamData();
  } else if (state === 7) {
    console.log("stop recording");
    data.resetDatapacket("record");
    data.resetDatapacket("stream");
    data.setTime(0);
  } else if (state === 8) {
    console.log("finished script");
    data.uploadFile();
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
  } else if (state == 13) {
    console.log("authentication");
    data.storeToken(packet);
    data.authenticate();
  } else if (state == 14) {
    console.log("set folder id");
    data.setFolderId(packet);
  } else if (state == 15) {
    console.log("reset time");
    data.resetDatapacket("stream");
    data.setTime(0);
  } else if (state == 16) {
    console.log("start recording");
    filename = packet;
    data.writeToCSV(filename, "csv");
    data.resetDatapacket("record");
    data.resetDatapacket("stream");
    data.setTime(0);
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
