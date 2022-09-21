const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.erpRecord = require("./erpRecord.model.js")(sequelize, Sequelize);
db.dailyReport = require("./dailyTask.model.js")(sequelize, Sequelize);
db.salesDailyAttendance = require("./salesDailyAttendance")(sequelize, Sequelize);
db.crmDailyAttendance = require("./crmDailyAttendance")(sequelize, Sequelize);

module.exports = db;
