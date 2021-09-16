// imports
const fs = require("fs");
const express = require("express");
const app = express();
const http = require("http").Server(app);
const mongoose = require("mongoose");
const session = require("express-session");
const hbs = require("express-handlebars");
const passport = require("passport");
const localStrategy = require('passport-local').Strategy;
const bodyparser = require("body-parser");
const data = require("./data.js");
const io = require("socket.io")(http);
const StreamData = require("./models/streamData");
const User = require("./models/user.js");
const { Parser } = require("json2csv");
const { google } = require("googleapis");
const record = require("./record.js");
const { spawn } = require("child_process");

// Connect to mongoDB
const dbURI =
    "mongodb+srv://mgppmsad:myppms214@njscontrolpanel.jkayg.mongodb.net/PPMS-DATA?retryWrites=true&w=majority";

// If modifying these scopes, delete token.json.
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "secrets/token.json";
const CRED_PATH = "secrets/credentials.json";

// Middleware
app.engine('hbs', hbs({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
app.use(session({
    secret: "verygoodsecret",
    resave: false,
    saveUninitialized: true
}));
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Passport.js
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    // Setup user model
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new localStrategy(function(email, password, done) {
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return done(null, false, { message: 'Email is not registered', redirect: '/error' })
            } else {
                if (user.validPassword(password)) {
                    return done(null, user, {message: 'User authenticated', redirect: '/home' })
                } else {
                    return done(null, false, {message: 'Password incorrect', redirect: '/error' })
                }
            }
        })
        .catch(err => console.log(err))
}))

// authenticate
function authenticate(
    credentialsPath,
    tokenPath,
    callback,
    filename,
    folderid
) {
    fs.readFile(credentialsPath, (err, content) => {
        if (err) return console.log("Error loading client secret file:", err);
        const { client_secret, client_id, redirect_uris } = JSON.parse(content).web;
        const oAuth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uris[0]
        );

        // Check if token has been created
        fs.readFile(tokenPath, (err, token) => {
            if (err) return getAccessToken(oAuth2Client);
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(oAuth2Client, filename, folderid);
        });
    });
}

// Google Drive file upload
function uploadFile(authClient, filename, folderid) {
    const mydrive = google.drive({ version: "v3", auth: authClient });
    const fileMetadata = {
        name: filename,
        parents: [folderid],
    };
    const media = {
        mimeType: "text/csv",
        body: fs.createReadStream(`data/${filename}.csv`),
    };
    mydrive.files.create({
            resource: fileMetadata,
            media: media,
            fields: "id",
        },
        (err, file) => {
            if (err) {
                // Handle error
                console.error(err);
            } else {
                console.log("File uploaded onto Google Drive");
                io.emit("fileuploaded", "");
            }
        }
    );
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

mongoose
    .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then((result) =>
        http.listen(3000, function() {
            console.log("HTTP server started on port 3000");
        })
    )
    .catch((err) => console.log(err));

// Global variable to store temp data
var myData;
var mongoData;
var opt;
var datapacket = {
    record_data: [],
    stream_data: [],
    id: "",
};
var counttotime = 0;
var time = 0;

async function getData() {
    myData = await data.getData();
}

function writeToDatabase(option, datapacket, livedata) {
    livedata["time"] = time;
    if (option == 0) {
        const stream = new StreamData(datapacket);
        stream
            .save()
            .then((result) => {
                //returns the objectID for append and update function
                io.emit("started-recording", result.id);
                // reset datapacket dictionary
                time = 0;
                livedata["time"] = time;
                datapacket["id"] = result.id;
                datapacket["record_data"].push(livedata);
                io.emit("datapacket", datapacket["record_data"]);
                time += 1;
            })
            .catch((err) => {
                console.log(err);
            });
    } else if (option == 2) {
        datapacket["record_data"].push(livedata);
        io.emit("datapacket", datapacket["record_data"]);
        time += 1;
    } else if (option == 1 || option == 3) {
        console.log(datapacket["record_data"]);
        StreamData.findByIdAndUpdate(datapacket["id"], datapacket)
            .then((result) => {
                time = 0;
                datapacket["record_data"] = [];
                datapacket["stream_data"] = [];
            })
            .catch((err) => {
                console.log(err);
            });
        io.emit("stopped-recording", option);
    } else {
        datapacket["stream_data"].push(livedata);
        io.emit("datapacket", datapacket["stream_data"]);
        time += 1;
    }
}

// mongoose and mongo
io.on("connection", function(socket) {

    socket.on("order", function(arg) {
        Orders = ["./python/script3.py"];
        for (var i = 0; i < arg.length; i++) {
            Orders.push(Object.values(arg[i]));
        }
        Orders.push(Orders.length);
        console.log(Orders);
        const python = spawn("python", Orders);
        python.stdout.on("data", function(data) {
            NewData = data.toString();
            console.log(NewData);
        });
    });

    socket.on("reset-stream-data", () => {
        datapacket["stream_data"] = [];
        time = 0;
    });

    socket.on("record-state", function(state) {
        record.set_state(state);
    });

    socket.on("token", function(token) {
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) return console.error(err);
            console.log("Token stored to", TOKEN_PATH);
        });
    });

    socket.on("export", function(data) {
        const [filename, folderid] = data;
        const fields = [
            "temp",
            "field",
            "Vx1",
            "Vy1",
            "freq1",
            "theta1",
            "Vx2",
            "Vy2",
            "freq2",
            "theta2",
        ];
        const transforms = [];
        const json2csvParser = new Parser({ fields, transforms });
        console.log(mongoData);
        if (mongoData != null) {
            const csv = json2csvParser.parse(mongoData);
            fs.writeFile(`data/${filename}.csv`, csv, (err) => {
                if (err) console.log(err);
                else {
                    authenticate(CRED_PATH, TOKEN_PATH, uploadFile, filename, folderid);
                }
            });
        }
    });
});



app.get("/signup", function(req, res) {
    res.sendFile(__dirname + "/views/signup.html");
});

app.post("/signup", async (req, res) => {
    var newUser = new User({
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        groupkey: req.body.groupkey
    });
    newUser.setPassword(req.body.password);
    await newUser
        .save()
        .then(() => {
            var redir = { redirect: '/login' };
            return res.json(redir);
        })
        .catch(err => {
            console.log("error is ", err.message);
            var redir = { redirect: '/error' };
            return res.json(redir);
        })

})

// app.post("/login", async (req, res) => {
//     console.log(req.body.email);
//     await User.findOne({ email: req.body.email }, function(err, user) {
//             if (user == null) {
//                 var redir = { redirect: '/error' };
//                 console.log("Could not find email.")
//                 return res.json(redir);
//             } else {
//                 if (user.validPassword(req.body.password)) {
//                     var redir = { redirect: '/home' };
//                     console.log("Authentication Successful");
//                     return res.json(redir);
//                 } else {
//                     var redir = { redirect: '/error' };
//                     console.log("Incorrect Password")
//                     return res.json(redir);
//                 }
//             }
//         })
//         .catch(err => {
//             console.log("Error is ", err.message);
//         });
// });

app.post("/login", async (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
  })(req, res, next);
});

app.get("/login", function(req, res) {
    res.sendFile(__dirname + "/views/login.html");
});

app.get("/home", function(req, res) {
    res.sendFile(__dirname + "/views/home.html");
});

app.get("/index", function(req, res) {
    res.sendFile(__dirname + "/views/index.html");
});

app.get("/graphs", function(req, res) {
    res.sendFile(__dirname + "/views/graphs.html");
});

app.get(
    "/gd",
    async function(req, res, next) {
            res.sendFile(__dirname + "/views/gd.html");
            await sleep(500);
            next();
        },
        function(req, res, next) {
            if (datapacket["id"] != null) {
                StreamData.findById(datapacket["id"]).then((res) => {
                    mongoData = res.toJSON().record_data;
                    console.log(mongoData);
                    io.emit("mongoData", mongoData);
                });
            }
        }
);

app.get("/chartjs-plugin.js", function(req, res) {
    res.sendFile(__dirname + "/plugins/chartjs-plugin-zoom.min.js");
});

app.get("/vue-color.min.js", function(req, res) {
    res.sendFile(__dirname + "/plugins/vue-color.min.js");
});

// retrieve temp data on set interval
// setInterval(function () {
//   getData();
//   // send it to all connected clients
//   io.emit("data", myData);
//   opt = record.recording();
//   if (myData != undefined) {
//     writeToDatabase(opt, datapacket, myData);
//   }

//   // console.log('Last updated: ' + new Date());
// }, 1000);