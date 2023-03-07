const msDBConfig = require("../config/frtdb.config.js");
const Sequelize = require("sequelize");


const sequelize = new Sequelize(msDBConfig.DB, msDBConfig.USER, msDBConfig.PASSWORD, {
    dialect: msDBConfig.dialect,
    host: msDBConfig.HOST,
    port:"62506",
    dialectOptions: {
      authentication: {
        type: 'default',
        options: {
          domain: msDBConfig.HOST,
          userName: msDBConfig.USER,
          password: msDBConfig.PASSWORD
        }
      },
      instanceName:"SQLEXPRESS",
      options: {
        encrypt: false
  
      }
    }
  })

const frtdb = {};

frtdb.Sequelize = Sequelize;
frtdb.sequelize = sequelize;


module.exports = frtdb;
