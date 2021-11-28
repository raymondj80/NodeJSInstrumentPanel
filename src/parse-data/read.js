class DataReadWrite {
    constructor({socket, path, fs, json2csv, spawn}) {
        this.datapacket = {
            record_data: [],
            stream_data: [],
        };
        this.time = 0;
        this.socket = socket;
        this.path = path;
        this.fs = fs;
        this.json2csv = json2csv;
        this.spawn = spawn;
    }

    async updateStreamData(data) {
        this.datapacket["stream_data"].push(data);
        this.socket.emit("datapacket", this.datapacket["stream_data"]);
        this.time += 1;
    }

    async updateRecordData(data) {
        this.datapacket["record_data"].push(data);
        this.socket.emit("datapacket", this.datapacket["stream_data"]);
        this.time += 1;
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

    async fetchData() {
        var Data = null;
        return Promise.resolve().then((v) => {
            const process = this.spawn("python", ["./python/fetch_data.py"]);
            process.stdout.on("data", function (data) {
            jsonData = JSON.parse(data.toString());
            });
            try {
            Data = jsonData;
            } catch (error) {
            }
            return Data;
        });
    }

    async _makefolder(foldername) {
        if (!fs.existsSync(foldername)) {
            fs.mkdirSync(foldername);
        }
    }
}

module.exports = DataReadWrite;
