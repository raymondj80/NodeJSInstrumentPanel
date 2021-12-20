const express = require("express");
const app = express();
const http = require("http").Server(app);
const path = require("path");
const mongoose = require("mongoose");
const io = require("socket.io")(http);
require("dotenv").config({ path: "src/.env" });

// Instantiate background process
const bprocess = require("./process/bprocess.js");
const routes = require("./routes/routes.js");
require("./process/bprocess.js")(io);

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

app.use(express.static(__dirname + "/public"));
app.use("/", routes);
bprocess.backgroundProcess(1000);
