class DataReadWrite {
  constructor({ io, path, fs, json2csv, spawn }) {
    this.datapacket = {
      record_data: [],
      stream_data: [],
    };
    this.time = 0;
    this.jsonData = null;
    this.socket = io;
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

  async updateHeaders(data) {
    this.socket.emit("data", this.jsonData);
  }

  async writeToCSV(foldername, filename, data) {
    const folder = path.join(__dirname, foldername);
    const file = path.join(folder, filename + ".csv");
    this._makefolder(foldername);

    let rows;
    if (!fs.existsSync(file)) {
      rows = this.json2csv(data, { header: true });
    } else {
      rows = this.json2csv(data, { header: false });
    }
    this.fs.appendFileSync(file, rows);
    this.fs.appendFileSync(file, "\r\n");
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

  async _makefolder(foldername) {
    if (!fs.existsSync(foldername)) {
      fs.mkdirSync(foldername);
    }
  }
}

module.exports.Data = DataReadWrite;
