class BController {
  constructor({ io, ee }) {
    this.io = io;
    this.ee = ee;
    this.cnt = 0;
    this.time = 0;
    this.state = -1;
    this.prev = 0;
    this.data = null;
    this.file = null;
  }

  // Event emitter to communicate with DataReadWrite class
  async setIOListener() {
    var self = this;
    self.ee.on("run-script", function (log) {
      console.log('in run-script loop');
      if (log["record"] && log["cmd"] == "Rec") { 
        self.setState(16, log["file"]);
        self.file = log["file"];
      } else if (log["num"] == -1) {
        self.io.emit("stop_script");
        self.setState(8, null);
      } else if (self.state == 5 && !log["record"]) {
        self.file = null;
        self.setState(7, null);
      }
    });

    // socket connection messages to change state
    self.io.on("connection", function (socket) {
      socket.on("logged-in", function (email) {
        self.setState(10, email);
      });
      socket.on("logged-out", function (email) {
        self.setState(11, email);
      });
      socket.on("save-script", function (data) {
        self.setState(1, data);
      });
      socket.on("delete-script", function (name) {
        self.setState(12, name);
      });
      socket.on("get-script-names", function () {
        self.setState(2, null);
      });
      socket.on("get-script", function (name) {
        self.setState(3, name);
      });
      socket.on("run-script", function (name) {
        self.setState(4, name);
      });
      socket.on("start-manual-record", function (data) {
        self.setState(9, data);
      });
      socket.on("stop-manual-record", function () {
        self.setState(8, null);
      });
      socket.on("authenticate", function (token) {
        self.setState(13, token);
      });
      socket.on("upload", function (folderid) {
        self.setState(14, folderid);
      });
      socket.on("reset-time", function () {
        if (self.prev != 5) self.setState(15, null); // if not script recording
      });
    });
  }

  setState(val, data) {
    this.state = val;
    this.data = data;
    // check data['time'] to get valid time
    if (data != null && data.constructor == Object && "time" in data) {
      this.time = this.data["time"];
    }
  }

  async getState() {
    /* If prev state != current state means that a packet was received 
      either from the client side socket or event emitter*/
    if (this.prev != this.state) {
      if ((this.prev == 5) & (this.state == 6)) {
        this.io.emit("stop_script_recording", this.file);
        this.state = 7;
        this.file = null;
      } else if (this.state == 4) {
        this.io.emit("script_recording", this.file);
      } else if ((this.prev == 9) & (this.state == 8)) {
        this.cnt = 0;
      }
      //Spencer test 1/28/22: if goes from script recording to stop recording, try to stop script. Update: it worked.
      //...but there was a "GaxiosError: Login Required"
      // else if ((this.prev == 5) & (this.state == 7)) {
      //   this.state = 8;
       }
     else {
      /* If prev state == current state means we've already run the process once
    and may want to transition to a different state */
      if (this.state == 9 && this.cnt == this.time) {
        //if script recording, and time reached, end recording
        this.state = 8;
        this.time = null;
        this.cnt = 1;
        this.io.emit("finished_recording");
      } else if (this.state == 9) {
        // if script recording, continue recording
        this.state = 9;
        this.cnt += 1;
      } // if finished recording or started script, go to running script
      else if (this.state == 4 || this.state == 7) this.state = 6;
      // if saving user session go to logged out
      else if (this.state == 11) this.state = -1;
      // if deleting script go to fetch script names
      else if (this.state == 12) this.state = 2;
      // if script recording continue recording
      else if (this.state == 5) this.state = 5;
      // if script running continue running
      else if (this.state == 6) this.state = 6;      
      // if started script recording continue to script recording
      else if (this.state == 16) this.state = 5;
      else this.state = 0; // default idle state
    }
    if (this.state == 5) this.data = this.file;
    this.prev = this.state;
    return [this.state, this.data];
  }
}

module.exports = BController;
