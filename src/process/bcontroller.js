class BController {
  constructor({ io, ee }) {
    this.io = io;
    this.ee = ee;
    this.cnt = 0;
    this.state = 0;
    this.prev = 0;
    this.data = null;
    this.file = null;
  }

  async setIOListener() {
    var self = this;
    self.ee.on("run-script", function (log) {
      if (log["record"]) {
        self.setState(5, log["file"]);
        self.file = log["file"];
      } else if (log["num"] == -1) {
        self.io.emit("stop_script");
        self.setState(8, null);
      } else self.setState(6, null);
    });

    self.io.on("connection", function (socket) {
      socket.on("save-script", function (data) {
        self.setState(1, data);
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
      socket.on("record-state", function (data) {
        self.setState(9, data);
        this.time = (+data['time'][0] * 60 * 60 + +data['time'][1] * 60 + +data['time'][2] - 1)
        console.log(this.time)
      });
    });
  }

  setState(val, data) {
    this.state = val;
    this.data = data;
  }

  async getState() {
    if (this.prev != this.state) {
      if ((this.prev == 5) & (this.state == 6)) {
        this.io.emit("stop_script_recording", this.file);
        this.state = 7;
        this.file = null;
      } else if ((this.prev == 4 || this.prev == 6) & (this.state == 5)) {
        this.io.emit("script_recording", this.file);
      }
    } else {
      // if recording continue recording
      if (this.cnt > this.time) {
        this.state = 8;
        this.cnt = 0;
      } else if (this.state == 5) {
        this.state = 5;
        this.cnt += 1;
      } 
      else if (this.state == 6) this.state = 6;
      else if (this.state == 7) this.state = 6;
      else {
        this.state = 0;
        this.data = null;
      }
    }
    this.prev = this.state;
    return [this.state, this.data];
  }
}

module.exports = BController;
