const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyparser = require("body-parser");
const passport = require("passport");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const { Parser } = require("json2csv");
const { google } = require("googleapis");
const record = require("./record.js");
const StreamData = require("./models/streamData");
const data = require("./data.js");

const PORT = process.env.PORT || 3000;

// Instantiate global var
var myData;
var mongoData;
var opt;
var datapacket = {
<<<<<<< HEAD
  record_data: [],
  stream_data: [],
  id: "",
=======
    record_data: [],
    stream_data: [],
    id: "",
>>>>>>> da8b409438dd6a2cc3d985a4d68019b14c028b4c
};
var counttotime = 0;
var time = 0;

//Passport Config
<<<<<<< HEAD
require("./config/passport")(passport);

// DB Config
const db = require("./config/keys").MongoURI;

// Bodyparser
app.use(express.urlencoded({ extended: false }));

// Express Session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
=======
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').MongoURI;

// Bodyparser
app.use(express.urlencoded({extended: false }));
app.use(bodyparser.json());

// Express Session
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true,
}));
>>>>>>> da8b409438dd6a2cc3d985a4d68019b14c028b4c

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect MongoDB
mongoose
<<<<<<< HEAD
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("MongoDB Connected... "))
  .catch((err) => console.log(err));

//Routes
app.use("/", require("./routes/routes"));
app.set("datapacket", datapacket);
app.use("/users", require("./routes/users"));

// Start Server
http.listen(3000, console.log(`Server started on port ${PORT}`));

//Socket.io (send orders, record state, store token, export)
io.on("connection", function (socket) {
  socket.on("order", function (arg) {
    Orders = ["./python/script3.py"];
    for (var i = 0; i < arg.length; i++) {
      Orders.push(Object.values(arg[i]));
    }
    Orders.push(Orders.length);
    console.log(Orders);
    const python = spawn("python", Orders);
    python.stdout.on("data", function (data) {
      NewData = data.toString();
      console.log(NewData);
    });
  });

  socket.on("reset-stream-data", () => {
    datapacket["stream_data"] = [];
    time = 0;
  });

  socket.on("record-state", function (state) {
    record.set_state(state);
  });

  socket.on("token", function (token) {
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) return console.error(err);
      console.log("Token stored to", TOKEN_PATH);
    });
  });

  socket.on("export", function (data) {
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

// Stream Data
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
=======
    .connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() =>
        console.log("MongoDB Connected... ")
    )
    .catch((err) => console.log(err));


//Routes 
app.use('/', require('./routes/routes'));
app.set('datapacket', datapacket);
app.use('/users', require('./routes/users'));


// Start Server 
http.listen(3000, console.log(`Server started on port ${PORT}`));

//Socket.io (send orders, record state, store token, export)
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


// Stream Data
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
>>>>>>> da8b409438dd6a2cc3d985a4d68019b14c028b4c
}

setInterval(function () {
  getData();
  // send it to all connected clients
<<<<<<< HEAD
  console.log(myData);
=======
>>>>>>> da8b409438dd6a2cc3d985a4d68019b14c028b4c
  io.emit("data", myData);
  opt = record.recording();
  if (myData != undefined) {
    writeToDatabase(opt, datapacket, myData);
  }
}, 1000);

// Google Drive Authentication

// If modifying these scopes, delete token.json.
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = "secrets/token.json";
const CRED_PATH = "secrets/credentials.json";

// authenticate
function authenticate(
<<<<<<< HEAD
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
=======
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
>>>>>>> da8b409438dd6a2cc3d985a4d68019b14c028b4c
}

// Google Drive file upload
function uploadFile(authClient, filename, folderid) {
<<<<<<< HEAD
  const mydrive = google.drive({ version: "v3", auth: authClient });
  const fileMetadata = {
    name: filename,
    parents: [folderid],
  };
  const media = {
    mimeType: "text/csv",
    body: fs.createReadStream(`data/${filename}.csv`),
  };
  mydrive.files.create(
    {
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
        io.emit("fileuploaded");
      }
    }
  );
}
=======
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
                io.emit("fileuploaded");
            }
        }
    );
}


>>>>>>> da8b409438dd6a2cc3d985a4d68019b14c028b4c
