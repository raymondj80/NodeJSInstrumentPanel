const app = require("express")();
const http = require("http").Server(app);
var path = require("path");
const mongoose = require("mongoose");
const io = require("socket.io")(http);
const read = require("./datareadwrite/readwrite.js");
const routes = require("./routes/routes.js");
const fs = require("fs");
const json2csv = require("json2csv").parse;
var { spawn } = require("child_process");

require("dotenv").config({ path: "src/.env" });

const PORT = process.env.PORT;
const dbURI = process.env.DBURI;

// Instantiate server and mongoDB
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) =>
    http.listen(PORT, function () {
      console.log("HTTP server started on port 3000");
    })
  )
  .catch((err) => console.log(err));

app.set("views", path.join(__dirname, "views"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

app.use("/", routes);

const r = new read.Data({ io, path, fs, json2csv, spawn });

setInterval(async function () {
  r.fetchInstrumentData();
  r.updateHeaders();
}, 1000);
