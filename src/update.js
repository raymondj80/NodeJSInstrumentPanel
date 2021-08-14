var saveCnt = 0;
// var dataDict = {
//   data: [],
//   id: "",
// };

// function appendData(socket, data) {
//   for (var key of Object.keys(dataDict)) {
//     if (key != "id") {
//       dataDict[key].push(data);
//     }
//   }
// }

function saveDict(action, id, data) {
  if (action === "new") {
    socket.emit("new", data);
  } else if (action === "append") {
    dataDict["id"] = id;
    socket.emit("append", data);
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
