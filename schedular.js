const express = require("express");
const cors = require("cors");

const app = express();

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");

db.sequelize.sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

const msdb = require("./app/msModels/index");

msdb.sequelize.sync()
  .then(() => {
    console.log("Synced MS-SQL db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

const awsdb = require("./app/awsModels/index");

awsdb.sequelize.sync()
  .then(() => {
    console.log("Synced AWS MY-SQL db.");
  })
  .catch((err) => {
    console.log("Failed to sync aws db: " + err.message);
  });

const frtDB = require("./app/frtModel/index");

frtDB.sequelize.sync()
  .then(() => {
    console.log("Synced FRT SQL db.");
  })
  .catch((err) => {
    console.log("Failed to sync FRT db: " + err.message);
  });
// // drop the table if it already exists
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Microtek-schedular" });
});

require("./app/routes/schedular.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
