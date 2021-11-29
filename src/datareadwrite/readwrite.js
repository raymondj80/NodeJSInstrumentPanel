class DataReadWrite {
  constructor({ io, ee, path, fs, json2csv, spawn }) {
    this.datapacket = {
      record_data: [],
      stream_data: [],
    };
    this.time = 0;
    this.jsonData = null;
    this.state = null;
    this.socket = io;
    this.ee = ee;
    this.path = path;
    this.fs = fs;
    this.json2csv = json2csv;
    this.spawn = spawn;
  }

  async updateStreamData() {
    this.datapacket["stream_data"].push(this.jsonData);
    this.socket.emit("datapacket", this.datapacket["stream_data"]);
    this.time += 1;
  }

  async updateRecordData() {
    this.datapacket["record_data"].push(this.jsonData);
    this.socket.emit("datapacket", this.datapacket["stream_data"]);
    this.time += 1;
  }

  async updateHeaders() {
    this.socket.emit("data", this.jsonData);
  }

  async writeToCSV(filename, foldername) {
    var self = this;
    const folder = self.path.join(__dirname, "../" + foldername);
    const file = self.path.join(folder, filename + ".csv");
    self._makefolder(folder);

    let rows;
    if (!self.fs.existsSync(file)) {
      rows = self.json2csv(self.jsonData, { header: true });
    } else {
      rows = self.json2csv(self.jsonData, { header: false });
    }
    self.fs.appendFileSync(file, rows);
    self.fs.appendFileSync(file, "\r\n");
  }

  async saveFile(filename, foldername, filedata) {
    const folder = this.path.join(__dirname, "../" + foldername);
    const file = this.path.join(folder, filename);
    if (!this.fs.existsSync(folder)) {
      this.fs.mkdirSync(folder);
    }
    this.fs.writeFile(file, filedata, function (err) {
      if (err) return console.log(err);
    });
  }

  async getFileContent(filename, foldername) {
    const file = this.path.join(__dirname, "../" + foldername, filename);
    const data = this.fs.readFileSync(file, "utf8");
    return data;
  }

  async getFileNames(foldername) {
    const folder = this.path.join(__dirname, "../" + foldername);
    var myfiles = [];
    var files = this.fs.readdirSync(folder);
    for (var i in files) {
      myfiles.push(files[i]);
    }
    return myfiles;
  }

  async emitMessage(msg, packet) {
    this.socket.emit(msg, packet);
  }

  async fetchInstrumentData() {
    /*Run a child process to get the PPMS and SR860 Lock-in data */
    let _data;
    const process = this.spawn("python", [
      this.path.join(__dirname, "./python/fetch_data.py"),
    ]);
    process.stdout.on("data", function (data) {
      _data = JSON.parse(data.toString());
    });
    process.on("close", (code) => {
      this.jsonData = _data;
    });
  }

  async runScript(script) {
    var self = this;
    const process = this.spawn("python", [
      "-u",
      this.path.join(__dirname, "./python/run_script.py"),
      script,
    ]);
    process.stdout.on("data", function (script_log) {
      script = JSON.parse(script_log.toString());
      self.ee.emit("run-script", script);
    });
  }

  async _makefolder(foldername) {
    if (!this.fs.existsSync(foldername)) {
      this.fs.mkdirSync(foldername);
    }
  }
}

module.exports = DataReadWrite;
