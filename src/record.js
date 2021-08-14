var start_recording = false;
var stop_recording = false;
var counts = -1;
var sampleRate = 1;

function set_state(state) {
  [time, start_record, stop_record] = state;
  counts = Math.round(
    (+time[0] * 60 * 60 + +time[1] * 60 + +time[2] - 1) / sampleRate
  );
  start_recording = start_record;
  stop_recording = stop_record;
}

function recording() {
  if (start_recording) {
    start_recording = false;
    return 0;
  } else if (stop_recording) {
    counts = -1;
    stop_recording = false;
    return 1;
  } else if (counts > 0) {
    counts = counts - 1;
    return 2;
  } else if (counts == 0) {
    counts = counts - 1;
    return 3;
  }
  return 4;
}

module.exports.recording = recording;
module.exports.set_state = set_state;
