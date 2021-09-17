const express = require('express');
const router = express.Router();
const path = require('path');

datapacket = {};

router.get('/', (req, res) => res.send('Welcome'));

router.get("/home", function(req, res) {
    res.sendFile( path.join(__dirname, "../views/home.html"));
});

router.get("/graphs", function(req, res) {
    res.sendFile(path.join(__dirname, "../views/graphs.html"));
});

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


router.get(
    "/gd",
    async function(req, res, next) {
            res.sendFile(path.join(__dirname, "../views/gd.html"));
            await sleep(500);
            next();
        },
        function(req, res, next) {
            if (datapacket["id"] != null) {
                StreamData.findById(datapacket["id"]).then((res) => {
                    mongoData = res.toJSON().record_data;
                    console.log(mongoData);
                    io.emit("mongoData", mongoData);
                });
            }
        }
);

router.get("/chartjs-plugin.js", function(req, res) {
    res.sendFile(path.join(__dirname, "../plugins/chartjs-plugin-zoom.min.js"));
});

router.get("/vue-color.min.js", function(req, res) {
    res.sendFile(path.join(__dirname, "../plugins/vue-color.min.js"));
});

// module.exports = function(req, res, next) {
//     datapacket = req.app.get('datapacket');
//     return router;
// }

module.exports = router;