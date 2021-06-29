
const logOutput = (name) => (data) => console.log(`[${name}] ${data}`);


// imports 
var app = require('express')();
var http = require('http').Server(app);
var data = require('./data.js');
var io = require('socket.io')(http);

// Global variable to store temp data
var tempData;

async function getData() {
    tempData = await data.getTemp();
    console.log(tempData);
}

getData();

io.on('connection', function(socket){
    socket.emit('data', tempData)
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});
 
http.listen(3000, function(){
    console.log('HTTP server started on port 3000');
});


// retrieve temp data on set interval
setInterval(function() {
    getData();
    // send it to all connected clients
    io.emit('data', tempData);
    console.log('Last updated: ' + new Date());
}, 300);

