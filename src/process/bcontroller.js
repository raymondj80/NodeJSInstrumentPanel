class BController {
  constructor({ io }) {
    this.io = io;
    this.state = 0;
    this.prev = 0;
    this.data = null;
  }

  async setIOListener() {
    var self = this;
    this.io.on("connection", function (socket) {
      socket.on("save-script", function (data) {
        self.setState(1, data);
      });
      socket.on("get-script-names", function () {
        console.log("getting script names...");
        self.setState(2, null);
      });
    });
  }

  setState(val, data) {
    this.state = val;
    this.data = data;
  }

  async getState() {
    if (this.prev != 0) {
      this.state = 0;
      this.data = null;
    }
    this.prev = this.state;
    return [this.state, this.data];
  }
}

module.exports = BController;
