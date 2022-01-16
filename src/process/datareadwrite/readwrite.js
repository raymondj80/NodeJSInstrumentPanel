class DataReadWrite {
  constructor({ io, ee, path, fs, Parser, csvtojson, spawn, Users, google }) {
    this.datapacket = {
      record_data: [],
      stream_data: [],
    };
    this.time = 0;
    this.userid = "";
    this.folderid = "";
    this.filename = "";
    this.jsonData = null;
    this.state = null;
    this.oauth2Client = null;
    this.socket = io;
    this.ee = ee;
    this.path = path;
    this.fs = fs;
    this.google = google;
    this.json2csv = Parser;
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
    self.filename = filename + ".csv";
    self._makefolder(folder);

    let rows;
    if (!self.fs.existsSync(file)) {
      const parser = new self.json2csv({ header: true });
      rows = parser.parse(self.jsonData);
      self.fs.appendFileSync(file, rows);
      self.fs.appendFileSync(file, "\r\n");
    } else {
      const parser = new self.json2csv({ header: false });
      rows = parser.parse(self.jsonData);
      self.fs.appendFileSync(file, rows);
      self.fs.appendFileSync(file, "\r\n");
    }
    console.log(rows);
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
    const scriptPath = this.path.join(__dirname, "../../" + "scripts");
    this.Users.updateOne(
      { _id: this.userid },
      {
        $pull: {
          Scripts: {
            name: scriptname,
          },
        },
      }
    ).then((res) => {
      console.log(res);
      this.fs.unlink(this.path.join(scriptPath, scriptname), (error) => {
        if (error) console.log(error);
      });
    });
  }

  async csvsavetodb(csvFile, csvPath) {
    const csvpath = this.path.join(csvPath, csvFile);
    console.log(csvpath);
    this.csvtojson()
      .fromFile(csvpath)
      .then((jsonObj) => {
        this.Users.findByIdAndUpdate(this.userid, [
          {
            $set: {
              Csvs: {
                $reduce: {
                  input: { $ifNull: ["$Csvs", []] },
                  initialValue: { csvs: [], update: false },
                  in: {
                    $cond: [
                      { $eq: ["$$this.name", csvFile] },
                      {
                        csvs: {
                          $concatArrays: [
                            "$$value.csvs",
                            [{ name: "$$this.name", csv: jsonObj }],
                          ],
                        },
                        update: true,
                      },
                      {
                        csvs: {
                          $concatArrays: ["$$value.csvs", ["$$this"]],
                        },
                        update: "$$value.update",
                      },
                    ],
                  },
                },
              },
            },
          },
          {
            $set: {
              Csvs: {
                $cond: [
                  { $eq: ["$Csvs.update", false] },
                  {
                    $concatArrays: [
                      "$Csvs.csvs",
                      [{ name: csvFile, csv: jsonObj }],
                    ],
                  },
                  { $concatArrays: ["$Csvs.csvs", []] },
                ],
              },
            },
          },
        ]).then((res) => {
          this.fs.unlink(this.path.join(csvPath, csvFile), (error) => {
            if (error) console.log(error);
          });
        });
      });
  }

  async scriptsavetodb(filename, scriptPath) {
    const data = this.fs.readFileSync(
      this.path.join(scriptPath, filename),
      "utf8"
    );
    this.Users.findByIdAndUpdate(this.userid, [
      {
        $set: {
          Scripts: {
            $reduce: {
              input: { $ifNull: ["$Scripts", []] },
              initialValue: { scripts: [], update: false },
              in: {
                $cond: [
                  { $eq: ["$$this.name", filename] },
                  {
                    scripts: {
                      $concatArrays: [
                        "$$value.scripts",
                        [{ name: "$$this.name", script: data }],
                      ],
                    },
                    update: true,
                  },
                  {
                    scripts: {
                      $concatArrays: ["$$value.scripts", ["$$this"]],
                    },
                    update: "$$value.update",
                  },
                ],
              },
            },
          },
        },
      },
      {
        $set: {
          Scripts: {
            $cond: [
              { $eq: ["$Scripts.update", false] },
              {
                $concatArrays: [
                  "$Scripts.scripts",
                  [{ name: filename, script: data }],
                ],
              },
              { $concatArrays: ["$Scripts.scripts", []] },
            ],
          },
        },
      },
    ]).then((res) => {
      this.fs.unlink(this.path.join(scriptPath, filename), (error) => {
        if (error) console.log(error);
      });
    });
  }

  async retrieveUserID(user_email) {
    this.Users.findOne({ email: user_email }).then((res) => {
      this.userid = res.id;
    });
  }

  async retrieveUserScripts(user_email, scriptPath) {
    // Make folder if none exists
    // this._makefolder(scriptPath);

    // Retrieve user scripts
    this.Users.findOne({ email: user_email }).then((res) => {
      var scripts = res.Scripts;
      scripts.forEach((script) => {
        this.fs.writeFile(
          this.path.join(scriptPath, script.name),
          script.script,
          (err) => {
            if (err) console.log(err);
          }
        );
      });
    });
  }

  async retrieveUserCsvs(user_email, csvPath) {
    var self = this;

    // Make folder if none exists
    // this._makefolder(csvPath);

    self.Users.findOne({ email: user_email }).then((res) => {
      var csvs = res.Csvs;
      csvs.forEach((csv) => {
        self.json2csv(csv.csv, { header: true }).then((converted_csv) =>
          self.fs.writeFile(
            self.path.join(csvPath, csv.name),
            converted_csv,
            (fserr) => {
              if (fserr) console.log(fserr);
            }
          )
        );
      });
    });
  }

  async loadOnLogin(user_email) {
    var self = this;
    const scriptPath = self.path.join(__dirname, "../../" + "scripts");
    const csvPath = self.path.join(__dirname, "../../" + "csv");
    self.retrieveUserID(user_email);
    self.retrieveUserScripts(user_email, scriptPath);
    self.retrieveUserCsvs(user_email, csvPath);
  }

  async saveOnLogout() {
    var self = this;
    const scriptPath = self.path.join(__dirname, "../../" + "scripts");
    const csvPath = self.path.join(__dirname, "../../" + "csv");
    self.fs.readdir(scriptPath, function (err, files) {
      if (err) {
        return console.log("Unable to scan directory: " + err);
      }
      files.forEach(function (filename) {
        self.scriptsavetodb(filename, scriptPath);
      });
    });
    self.fs.readdir(csvPath, function (err, files) {
      if (err) {
        return console.log("Unable to scan directory: " + err);
      }
      files.forEach(async (filename) => {
        console.log(filename);
        self.csvsavetodb(filename, csvPath);
      });
    });
  }

  async authenticate() {
    const TOKEN_PATH = this.path.join(__dirname, process.env.TOKEN_PATH);

    this.oauth2Client = new this.google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      process.env.REDIRECT_URL
    );
    this.fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(this.oauth2Client);
      this.oauth2Client.setCredentials(JSON.parse(token));
    });
  }

  async storeToken(token) {
    const TOKEN_PATH = this.path.join(__dirname, "../../secrets/token.json");
    this.fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) return console.log(err);
      console.log(`Token stored to ${TOKEN_PATH}`);
    });
  }

  async setFolderId(folderid) {
    console.log(folderid);
    this.folderid = folderid;
  }

  async uploadFile() {
    const mydrive = this.google.drive({
      version: "v3",
      auth: this.oauth2Client,
    });
    const testFilePath = this.path.join(
      __dirname,
      "../../",
      "csv",
      this.filename
    );
    const fileMetaData = {
      name: this.filename,
      parents: [this.folderid],
    };
    const media = {
      mimeType: "text/csv",
      body: this.fs.createReadStream(testFilePath),
    };
    mydrive.files.create(
      {
        resource: fileMetaData,
        media: media,
        fields: "id",
      },
      (err, file) => {
        if (err) console.log(err);
        else {
          console.log("File uploaded onto Google Drive");
        }
      }
    );
  }
}

module.exports = DataReadWrite;
