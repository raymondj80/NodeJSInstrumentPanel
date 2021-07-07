// imports 
const app = require('express')();
const http = require('http').Server(app);
const mongoose = require('mongoose');
const { Stream } = require('stream');
const data = require('./data.js');
const io = require('socket.io')(http);
const StreamData = require('./models/streamData');

// import Vue from 'vue';
// Connect to mongoDB
const dbURI = 'mongodb+srv://mgppmsad:myppms214@njscontrolpanel.jkayg.mongodb.net/PPMS-DATA?retryWrites=true&w=majority';

mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => http.listen(3000, function(){
        mongoose.set('useFindAndModify', false);
        console.log('HTTP server started on port 3000');
    }))
    .catch((err) => console.log(err))

// Global variable to store temp data
var myData;

async function getData() {
    myData = await data.getData();
    // console.log(myData);
}

getData();

// mongoose and mongo 
io.on('connection', function(socket){
    socket.on('new', function(data) {
        const stream = new StreamData(data);
        stream.save()
        .then((result) => {
            console.log(result)
            io.emit('objectID', result.id)
        })
        .catch((err) => {
            console.log(err);
        })
    });
    socket.on('append', function(data) {
        const filter = data.id;
        StreamData.findByIdAndUpdate(filter, data)
        .then((result) => {
            console.log(result)
        })
        .catch((err) => {
            console.log(err);
        })
    });
});

app.get('/', function(req, res){
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
setInterval(function() {
    getData();
    // send it to all connected clients
    io.emit('data', myData);
    // console.log('Last updated: ' + new Date());
}, 1000); 