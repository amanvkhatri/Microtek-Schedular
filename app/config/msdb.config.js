module.exports = {
    HOST: "192.168.1.170",
    USER: "sa",
    PASSWORD: "Test@2019",
    DB: "SavvyHRMS",
    dialect: "mssql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };
  