var saveCnt = 0;
var dataDict = {
    // "temp": [],
    // "field": [],
    // "Vx1": [],
    // "Vy1": [],
    // "freq1": [],
    // "theta1": [],
    // "Vx2": [],
    // "Vy2": [],
    // "freq2": [],
    // "theta2": [],
    "data": [],
    "id": '',
};

function appendData(socket, data) {
    for (var key of Object.keys(dataDict)) {
        if (key != 'id') {
            dataDict[key].push(data)
        }
    }
};

function saveDict(action, id) {
    if (action === 'new') {
        socket.emit('new', dataDict);
    }
    else if (action === 'append') {
        dataDict['id'] = id;
        // console.log(dataDict);
        socket.emit('append', dataDict);  
    }
    else {
        socket.emit('');
    }
    console.log("data emitted!");
}

function clearDict() {
    saveCnt = 0;
    dataDict = {
        "data:": [],
        "id": '',
    };
}
    