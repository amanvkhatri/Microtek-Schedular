module.exports = app => {
  const dailySchedular = require("../controllers/dailytask.schedular.controller.js");
  const frtSchedular = require("../controllers/frt.schedular.controller");
  var router = require("express").Router();

  app.use('/api/schedular', router);
};
