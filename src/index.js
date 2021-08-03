// imports 
const fs = require('fs');
const path = require('path');
const url = require('url');
const opn = require('open');
const destroyer = require('server-destroy');
const app = require('express')();
const http = require('http').Server(app);
const myhttp = require('http');
const mongoose = require('mongoose');
const data = require('./data.js');
const io = require('socket.io')(http);
const StreamData = require('./models/streamData');
const {Parser} = require('json2csv');
const readline = require('readline');
const {google} = require('googleapis');


// Connect to mongoDB
const dbURI = 'mongodb+srv://mgppmsad:myppms214@njscontrolpanel.jkayg.mongodb.net/PPMS-DATA?retryWrites=true&w=majority';

// Google Drive API v3 Web App
const CLIENT_ID = '869904555675-a1fk41ff31t74hb1trtfdgrc922o021j.apps.googleusercontent.com';
const CLIENT_SECRET = '0vlX0AhCYBPzbApXDSnzU7T1';
const REDIRECT_URL = 'http://localhost:3000/gd';

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
  );

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

/**
 * This is one of the many ways you can configure googleapis to use authentication credentials.  In this method, we're setting a global reference for all APIs.  Any other API you use here, like google.drive('v3'), will now use this auth client. You can also override the auth client at the service and method call levels.
 */
//  google.options({auth: oauth2Client});

/**
 * Open an http server to accept the oauth callback. In this simple example, the only request to our webserver is to /callback?code=<code>
 */
 async function authenticate(scopes) {
    return new Promise((resolve, reject) => {
      // grab the url that will be used for authorization
      const authorizeUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes.join(' '),
      });
      const server = myhttp
        .createServer(async (req, res) => {
          try {
            if (req.url.indexOf('/oauth2callback') > -1) {
              const qs = new url.URL(req.url, 'http://localhost:3000/gd')
                .searchParams;
              res.end('Authentication successful! Please return to the console.');
              server.destroy();
              const {tokens} = await oauth2Client.getToken(qs.get('code'));
              oauth2Client.credentials = tokens; // eslint-disable-line require-atomic-updates
              resolve(oauth2Client);
            }
          } catch (e) {
            reject(e);
          }
        })
        .listen(5000, () => {
          // open the browser to the authorize url to start the workflow
          opn(authorizeUrl, {wait: false}).then(cp => cp.unref());
        });
      destroyer(server);
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

    socket.on('export', function(data) {
        // const filename = data;
        // StreamData.findById(filter).then(res => {
        //     const myRes = res.toJSON().data;
        //     const fields = ['temp', 'field', 'Vx1', 'Vy1', 'freq1', 'theta1', 'Vx2', 'Vy2', 'freq2', 'theta2'];
        //     const transforms = [];
        //     const json2csvParser = new Parser({fields, transforms});
        //     const csv = json2csvParser.parse(myRes);
        //     fs.writeFile(`data/${filename}.csv`, csv, (err) => {
        //         if (err)
        //             console.log(err);
        //         else {
        //             io.emit('success');
        //             console.log("File written successfully\n");
        //         }
        //     });
        // });
        authenticate(SCOPES).catch(console.error);
       
    })
});

app.get('/index', function(req, res){
    res.sendFile(__dirname + '/views/index.html');
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
// setInterval(function() {
//     getData();
//     // send it to all connected clients
//     io.emit('data', myData);
//     // console.log('Last updated: ' + new Date());
// }, 1000); 