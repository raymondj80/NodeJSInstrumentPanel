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

const States = {
  LOGOUT: -1,
  IDLE: 0,
  SAVE: 1,
  FETCH_SCRIPT: 2,
  GET_SCRIPT: 3,
  START_SCRIPT: 4,
  SCRIPT_RECORD: 5,
  RUN_SCRIPT: 6,
  STOP_RECORD: 7,
  FINISH_SCRIPT: 8,
  MANUAL_RECORD: 9,
  LOAD_USER_SESSION: 10,
  SAVE_USER_SESSION: 11,
  DELETE_SCRIPT: 12,
  AUTHENTICATE: 13,
  SET_FOLDER_ID: 14,
  RESET_TIME: 15,
  START_RECORD: 16
}

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
  switch(state) {
    case States.LOGOUT:
      return;
    case States.IDLE:
      data.updateStreamData();
    case States.SAVE:
      filename = packet["name"];
      fildata = packet["data"];
    case States.FETCH_SCRIPT:
      let script_names = await data.getFileNames("scripts");
      data.emitMessage("returned_script_names", script_names);
    case States.GET_SCRIPT:
      filename = packet;
      let script = await data.getFileContent(filename, "scripts");
      data.emitMessage("returned_script", script);
    case States.START_SCRIPT:
      filename = packet;
      let script = await data.getFileContent(filename, "scripts");
      data.runScript(script);
      data.resetDatapacket("record");
      data.setTime(0);
      data.emitMessage("start_script");
    case States.SCRIPT_RECORD:
      filename = packet;
      data.updateRecordData();
      data.writeToCSV(filename, "csv");
    case States.STOP_RECORD:
      data.resetDatapacket("record");
      data.resetDatapacket("stream");
      data.setTime(0);
    case States.RUN_SCRIPT:
      data.updateStreamData();
    case States.FINISH_SCRIPT:
      data.uploadFile();
    case States.MANUAL_RECORD:
      filename = packet["name"];
      data.writeToCSV(filename, "csv");
    case States.LOAD_USER_SESSION:
      data.loadOnLogin(packet);
    case States.SAVE_USER_SESSION:
      data.saveOnLogout();
    case States.DELETE_SCRIPT:
      data.deleteScript(packet);
    case States.AUTHENTICATE:
      data.storeToken(packet);
      data.authenticate();
    case States.SET_FOLDER_ID:
      data.setFolderId(packet);
    case States.RESET_TIME:
      data.resetDatapacket("stream");
      data.setTime(0);
    case States.START_RECORD:
      filename = packet;
      data.writeToCSV(filename, "csv");
      data.resetDatapacket("record");
      data.resetDatapacket("stream");
      data.setTime(0);
  }

  // if (state === States.LOGOUT) {
  //   console.log("logged out");
  //   return;
  // } else if (state === States.IDLE) {
  //   data.updateStreamData();
  //   console.log("idle state");
  // } else if (state === States.SAVE) {
  //   console.log("save script");
  //   filename = packet["name"];
  //   filedata = packet["data"];
  //   data.saveFile(filename, "scripts", filedata);
  // } else if (state === 2) {
  //   console.log("fetch script names");
  //   let script_names = await data.getFileNames("scripts");
  //   data.emitMessage("returned_script_names", script_names);
  // } else if (state === 3) {
  //   console.log("getting script");
  //   filename = packet;
  //   let script = await data.getFileContent(filename, "scripts");
  //   data.emitMessage("returned_script", script);
  // } else if (state === 4) {
  //   console.log("start script");
  //   filename = packet;
  //   let script = await data.getFileContent(filename, "scripts");
  //   data.runScript(script);
  //   data.resetDatapacket("record");
  //   data.setTime(0);
  //   data.emitMessage("start_script");
  // } else if (state === 5) {
  //   console.log("script recording");
  //   filename = packet;
  //   data.updateRecordData();
  //   data.writeToCSV(filename, "csv");
  // } else if (state === 6) {
  //   console.log("running script");
  //   data.updateStreamData();
  // } else if (state === 7) {
  //   console.log("stop recording");
  //   data.resetDatapacket("record");
  //   data.resetDatapacket("stream");
  //   data.setTime(0);
  // } else if (state === 8) {
  //   console.log("finished script");
  //   data.uploadFile();
  // } else if (state === 9) {
  //   console.log("manual recording");
  //   filename = packet["name"];
  //   data.writeToCSV(filename, "csv");
  // } else if (state === 10) {
  //   console.log("loading user session");
  //   data.loadOnLogin(packet);
  // } else if (state === 11) {
  //   console.log("saving user session");
  //   data.saveOnLogout();
  // } else if (state === 12) {
  //   console.log("deleting script");
  //   data.deleteScript(packet);
  // } else if (state == 13) {
  //   console.log("authentication");
  //   data.storeToken(packet);
  //   data.authenticate();
  // } else if (state == 14) {
  //   console.log("set folder id");
  //   data.setFolderId(packet);
  // } else if (state == 15) {
  //   console.log("reset time");
  //   data.resetDatapacket("stream");
  //   data.setTime(0);
  // } else if (state == 16) {
  //   console.log("start recording");
  //   filename = packet;
  //   data.writeToCSV(filename, "csv");
  //   data.resetDatapacket("record");
  //   data.resetDatapacket("stream");
  //   data.setTime(0);
  // }

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
