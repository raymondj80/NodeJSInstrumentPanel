var cnt = 0;
var start_recording = false;
var stop_recording = false;
var counts = -1;
var saveCnt = 0;
var countup = 0;
var sampleRate = 1;
var datapacket = {
  data: [],
  id: "",
};

function saveDict(action, id, data) {
  if (action === "new") {
    socket.emit("new", datapacket);
  } else if (action === "append") {
    datapacket["id"] = id;
    datapacket["data"] = data;
    socket.emit("append", datapacket);
  }
}
function set_state(time, start_record, stop_record) {
  counts = Math.round(
    (+time[0] * 60 * 60 + +time[1] * 60 + +time[2] - 1) / sampleRate
  );
  start_recording = start_record;
  stop_recording = stop_record;
}

function recording(objectID, data) {
  console.log(stop_recording && !stop_recording);
  if (start_recording) {
    saveDict("new", objectID, data);
    start_recording = false;
    return 0;
  } else if (stop_recording && start_recording) {
    counts = -1;
    saveDict("append", objectID, data);
    stop_recording = false;
    return 1;
  } else if (counts > 0) {
    counts = counts - 1;
    return 2;
  } else if (counts == 0) {
    counts = counts - 1;
    saveDict("append", objectID, data);
    return 3;
  }
  return 4;
}
