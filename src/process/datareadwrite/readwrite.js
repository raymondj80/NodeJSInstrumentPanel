class DataReadWrite {
  constructor({ io, ee, path, fs, json2csv, csvtojson, spawn, Users }) {
    this.datapacket = {
      record_data: [],
      stream_data: [],
    };
    this.time = 0;
    this.userid = "";
    this.jsonData = null;
    this.state = null;
    this.socket = io;
    this.ee = ee;
    this.path = path;
    this.fs = fs;
    this.json2csv = json2csv;
    this.csvtojson = csvtojson;
    this.spawn = spawn;
    this.Users = Users;
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
    const folder = self.path.join(__dirname, "../../" + foldername);
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
    const folder = this.path.join(__dirname, "../../" + foldername);
    const file = this.path.join(folder, filename);
    if (!this.fs.existsSync(folder)) {
      this.fs.mkdirSync(folder);
    }
    this.fs.writeFile(file, filedata, function (err) {
      if (err) return console.log(err);
    });
  }

  async getFileContent(filename, foldername) {
    const file = this.path.join(__dirname, "../../" + foldername, filename);
    const data = this.fs.readFileSync(file, "utf8");
    return data;
  }

  async getFileNames(foldername) {
    const folder = this.path.join(__dirname, "../../" + foldername);
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
    console.log(script);
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

  async deleteScript(scriptname) {
    const scriptPath = this.path.join(__dirname, "../../" + 'scripts');
    this.Users.updateOne({_id: this.userid}, {
      $pull: {
        Scripts: {
          name: scriptname 
        }
      }
    }).then((res) => {
      console.log(res);
      this.fs.unlink(this.path.join(scriptPath, scriptname), error => {
        if (error) console.log(error);
      });
    });
  }

  async scriptsavetodb(filename, directoryPath) {
    const data = this.fs.readFileSync(this.path.join(directoryPath, filename), "utf8");
    this.Users.findByIdAndUpdate(this.userid, [ 
      { 
          $set: { 
              Scripts: {
                  $reduce: {
                      input: { $ifNull: [ "$Scripts", [] ] }, 
                      initialValue: { scripts: [], update: false },
                      in: {
                          $cond: [ { $eq: [ "$$this.name", filename ] },
                                   { 
                                     scripts: { 
                                        $concatArrays: [
                                            "$$value.scripts",
                                            [ { name: "$$this.name", script: data } ],
                                        ] 
                                      }, 
                                      update: true
                                   },
                                   { 
                                      scripts: { 
                                         $concatArrays: [ "$$value.scripts", [ "$$this" ] ] 
                                      }, 
                                      update: "$$value.update" 
                                   }
                          ]
                      }
                  }
              }
          }
      },
      { 
          $set: { 
              Scripts: { 
                  $cond: [ { $eq: [ "$Scripts.update", false ] },
                           { $concatArrays: [ "$Scripts.scripts", [ {name: filename, script: data} ] ] },
                           { $concatArrays: [ "$Scripts.scripts", [] ] }
                  ] 
              }
          }
      }
    ]).then((res) => {
      console.log(res.Scripts);
    });
  }

  async retrieveUserID(user_email) {
    console.log("retrieving user id");
    this.Users.findOne({email: user_email}).then((res) => {
      this.userid = res.id;
    })
  }

  async retrieveUserScripts(user_email, scriptPath) {
    console.log("retrieving user scripts");
    this.Users.findOne({email: user_email}).then((res) => {
      var scripts = res.Scripts;
      scripts.forEach((script) => {
        console.log(scriptPath);
          this.fs.writeFile(this.path.join(scriptPath, script.name), script.script, err => {
            if (err) console.log(err);
          });
      });
    })
  }

  async loadOnLogin(user_email) {
    var self = this;
    const scriptPath = self.path.join(__dirname, "../../" + 'scripts');
    console.log(scriptPath);
    self.retrieveUserID(user_email);
    self.retrieveUserScripts(user_email, scriptPath);
  }

  async saveOnLogout() {
    var self = this;
    const directoryPath = self.path.join(__dirname, "../../" + 'scripts');
    self.fs.readdir(directoryPath, function (err, files) {
      if (err) {
        return console.log('Unable to scan directory: ' + err);
      }
      files.forEach(function (filename) {
        self.scriptsavetodb(filename, directoryPath);
        self.fs.unlink(self.path.join(directoryPath, filename), error => {
          if (error) console.log(error);
        });
      });
    });
  }
}

module.exports = DataReadWrite;


