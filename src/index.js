// imports 
const fs = require('fs');
const app = require('express')();
const http = require('http').Server(app);
const mongoose = require('mongoose');
const data = require('./data.js');
const io = require('socket.io')(http);
const StreamData = require('./models/streamData');
const {Parser} = require('json2csv');
const {google} = require('googleapis');

// Connect to mongoDB
const dbURI = 'mongodb+srv://mgppmsad:myppms214@njscontrolpanel.jkayg.mongodb.net/PPMS-DATA?retryWrites=true&w=majority';

// If modifying these scopes, delete token.json.
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'secrets/token.json';
const CRED_PATH = 'secrets/credentials.json'

// authenticate
function authenticate(credentialsPath, tokenPath, callback, filename, folderid) {
    fs.readFile(credentialsPath, (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      const {client_secret, client_id, redirect_uris} = JSON.parse(content).web;
      const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

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
  const mydrive = google.drive({version: 'v3', auth: authClient});
  const fileMetadata = {
    'name': filename,
    parents: [folderid]
  };
  const media = {
    mimeType: 'text/csv',
    body: fs.createReadStream(`data/${filename}.csv`)
  };
  mydrive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id'
  }, (err, file) => {
    if (err) {
      // Handle error
      console.error(err);
    } else {
      console.log('File uploaded onto Google Drive');
    }
  });
}


mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => http.listen(3000, function(){
        mongoose.set('useFindAndModify', false);
        console.log('HTTP server started on port 3000');
    }))
    .catch((err) => console.log(err))


// Global variable to store temp data
var myData;
var filter;

async function getData() {
    myData = await data.getData();
}


// mongoose and mongo 
io.on('connection', function(socket){
    socket.on('new', function(dict) {
        const stream = new StreamData(dict);
        stream.save()
        .then((result) => {
            //returns the objectID for append and update function
            io.emit('objectID', result.id)
        })
        .catch((err) => {
            console.log(err);
        })
    });
    socket.on('append', function(data) {
        filter = data.id;
        console.log(data)
        StreamData.findByIdAndUpdate(filter, data)
        .then((result) => {
            // console.log(result)
        })
        .catch((err) => {
            console.log(err);
        })
    });

    socket.on('token', function(token) {
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
    })

    socket.on('export', function(data) {
        const [filename, folderid] = data;
        StreamData.findById(filter).then(res => {
            const myRes = res.toJSON().data;
            const fields = ['temp', 'field', 'Vx1', 'Vy1', 'freq1', 'theta1', 'Vx2', 'Vy2', 'freq2', 'theta2'];
            const transforms = [];
            const json2csvParser = new Parser({fields, transforms});
            const csv = json2csvParser.parse(myRes);
            fs.writeFile(`data/${filename}.csv`, csv, (err) => {
                if (err)
                  console.log(err);
                else {
                  authenticate(CRED_PATH, TOKEN_PATH, uploadFile, filename, folderid);
                }
            });
        });
    })

});

app.get('/home', function(req, res){
    res.sendFile(__dirname + '/views/home.html');
});

app.get('/graphs', function(req, res){
    res.sendFile(__dirname + '/views/graphs.html');
});

app.get('/gd', function(req, res){
    res.sendFile(__dirname + '/views/gd.html');
});

app.get('/update.js', function (req, res) {
    res.sendFile(__dirname + '/update.js');
  });

// retrieve temp data on set interval
setInterval(function() {
    getData();
    // send it to all connected clients
    io.emit('data', myData);
    // console.log('Last updated: ' + new Date());
}, 1000); 