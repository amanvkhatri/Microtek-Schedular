module.exports = app => {
  const dailySchedular = require("../controllers/dailytask.schedular.controller.js");
  var router = require("express").Router();

  app.use('/api/schedular', router);
};
