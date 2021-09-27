const express = require("express");
const router = express.Router();
const path = require("path");

datapacket = {};

const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");

router.get("/", forwardAuthenticated, (req, res) => res.render("welcome"));

router.get("/home", ensureAuthenticated, (req, res) => res.render("home"));

router.get("/graphs", ensureAuthenticated, (req, res) => res.render("graphs"));

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

var getData = function (req, res, next) {
  if (datapacket["id"] != null) {
    StreamData.findById(datapacket["id"]).then((result) => {
      res.locals.data = result.toJSON().record_data;
    });
  }
  next();
}

router.get("/gd", ensureAuthenticated, getData, (req, res) => res.render("gd", {data : res.locals.data}));

// router.get(
//   "/gd",
  
  // function (req, res, next) {
  //   if (datapacket["id"] != null) {
  //     StreamData.findById(datapacket["id"]).then((res) => {
  //       mongoData = res.toJSON().record_data;
  //       console.log(mongoData);
  //       io.emit("mongoData", mongoData);
  //     });
  //   }
  // }
// );

router.get("/chartjs-plugin.js", function (req, res) {
  res.sendFile(path.join(__dirname, "../plugins/chartjs-plugin-zoom.min.js"));
});

router.get("/vue-color.min.js", function (req, res) {
  res.sendFile(path.join(__dirname, "../plugins/vue-color.min.js"));
});

// module.exports = function(req, res, next) {
//     datapacket = req.app.get('datapacket');
//     return router;
// }

module.exports = router;
