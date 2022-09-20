const msDBConfig = require("../config/msdb.config");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(msDBConfig.DB, msDBConfig.USER, msDBConfig.PASSWORD, {
    dialect: msDBConfig.dialect,
    host: msDBConfig.HOST,
    dialectOptions: {
      authentication: {
        type: 'default',
        options: {
          domain: msDBConfig.HOST,
          userName: msDBConfig.USER,
          password: msDBConfig.PASSWORD
        }
      },
      options: {
        encrypt: false
  
      }
    }
  })

const msDB = {};

msDB.Sequelize = Sequelize;
msDB.sequelize = sequelize;

module.exports = msDB;
