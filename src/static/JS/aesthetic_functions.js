// Swap visibility
var function_div_list = ["temp_Div", "mag_Div"];

function display_function_div(ID) {
  if (window.app.visibilities.functions_div["DIV_ON"]) {
    document.getElementById("error_div").style.display = "none";
    for (i = 0; i < function_div_list.length; ++i) {
      if (function_div_list[i] === ID) {
        Swap_Visibility(ID);
      } else {
        x = document.getElementById(function_div_list[i]);
        x.style.display = "none";
      }
    }
  }
}

function Swap_Visibility(ID) {
  var x = document.getElementById(ID);
  if (x.style.display === "block") {
    x.style.display = "none";
  } else {
    x.style.display = "block";
  }
}

function is_Valid_Number(num, lower_bound, upper_bound, ERROR_ID) {
  if (!isNaN(num) && num.length > 0) {
    if (num < lower_bound || num > upper_bound) {
      if (document.getElementById(ERROR_ID).style.display === "none") {
        Swap_Visibility(ERROR_ID);
      }
      return false;
    } else {
      if (document.getElementById(ERROR_ID).style.display === "block") {
        Swap_Visibility(ERROR_ID);
      }
      return true;
    }
  } else {
    if (document.getElementById(ERROR_ID).style.display === "none") {
      Swap_Visibility(ERROR_ID);
    }
    return false;
  }
}

// update headers
function updateHeader(data) {
  for (var key in data) {
    // console.log(key);
    if (typeof data[key] === "number") {
      // round to 9 decimal places
      document.getElementById(key.concat("-header")).innerHTML =
        data[key].toFixed(9);
    } else {
      document.getElementById(key.concat("-header")).innerHTML = data[key];
    }
  }
}

function work_with_data(data) {
  updateHeader(data);
  storeData(data);
  if (JSON.parse(sessionStorage.recording)) {
    socket.emit("datapacket", JSON.parse(sessionStorage.streamData));
  }
  sessionStorage.cnt = parseInt(sessionStorage.cnt) + 1;
}

function start_recording(id) {
  sessionStorage.objectID = id;
  sessionStorage.recording = "true";
  t = window.app.time.split(":");
  window.app.log(
    `Recording data for ${t[0]} hour(s) ${t[1]} minute(s) ${t[2]} second(s)`
  );
}

function stop_recording(opt) {
  if (opt == 1) {
    sessionStorage.recording = "false";
    window.app.log("Stopped Recording...");
  } else {
    sessionStorage.recording = "false";
    window.app.log("Finished Recording");
  }
}
