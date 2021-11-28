const app = require("express")();
const http = require("http").Server(app);
var path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const io = require("socket.io")(http);
const Read = require("./parse-data/read.js");
const json2csv = require("json2csv").parse;
var spawn = require('child_process').spawn

require('dotenv').config({path: 'src/.env'})

const PORT = process.env.PORT;
const dbURI = process.env.DBURI;
var d = '';

// Instantiate server and mongoDB
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) =>
    http.listen(PORT, function () {
      console.log("HTTP server started on port 3000");
    })
  )
  .catch((err) => console.log(err));


const read = new Read({io, path, fs, json2csv, spawn});

setInterval(function () {
    d = read.fetchData();
    console.log(d);
}, 1000);