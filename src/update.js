var saveCnt = 0;
var dataDict = {
  data: [],
  id: "",
};

function appendData(socket, data) {
  for (var key of Object.keys(dataDict)) {
    if (key != "id") {
      dataDict[key].push(data);
    }
  }
}

function saveDict(action, id) {
  if (action === "new") {
    socket.emit("new", dataDict);
    console.log("data emitted!");
  } else if (action === "append") {
    dataDict["id"] = id;
    socket.emit("append", dataDict);
    console.log("data emitted!");
  } else {
    socket.emit("");
  }
}

function clearDict() {
  saveCnt = 0;
  dataDict = {
    "data:": [],
    id: "",
  };
}
