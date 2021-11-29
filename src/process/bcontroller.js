class BController {
  constructor({ io, ee }) {
    this.io = io;
    this.ee = ee;
    this.state = 0;
    this.prev = 0;
    this.data = null;
  }

  async setIOListener() {
    var self = this;
    self.ee.on("run-script", function (log) {
      if (log["record"]) self.setState(5, null);
      else if (log["num"] == -1) self.setState(8, null);
      else self.setState(6, null);
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
    });
  }

  setState(val, data) {
    this.state = val;
    this.data = data;
  }

  async getState() {
    if (this.prev == this.state) {
      if (this.state == 5) this.state == 5;         // if recording continue recording
      else if (this.state == 6) this.state == 6;    // if running exp continue exp
      else if ((this.prev == 5) & (this.state == 7)) this.state = 6;    // if stop, stop recording
      else if ((this.prev == 8) & (this.state == 6)) this.state = 0;    // if end, end exp
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
