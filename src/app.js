const express = require("express");
const expressLayouts = require('express-ejs-layouts');
const app = express();
const http = require("http").Server(app);
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require('connect-flash');
const session = require("express-session");
const io = require("socket.io")(http);
require("dotenv").config({ path: "src/.env" });
require("./config/passport")(passport);
// Instantiate background process



const bprocess = require("./process/bprocess.js");
bprocess(io);

// Instantiate ports
const PORT = process.env.PORT || 3000;
const dbURI = process.env.DBURI;

// Connect to MongoDB
mongoose
  .connect(
    dbURI,
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Middleware
app.use(expressLayouts);
app.set("view engine", "ejs");

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.use("/users", require("./routes/users.js"));
app.use("/", require("./routes/routes.js"));
app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname + "/public"));
bprocess.backgroundProcess(1000);

http.listen(PORT, console.log(`Server running on port ${PORT}`));