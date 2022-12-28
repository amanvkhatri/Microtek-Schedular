module.exports = {
  //HOST: "192.168.1.7",
  //USER: "testuser",
  //PASSWORD: "testuser@1234",
  HOST: "localhost",
  USER: "root",
  PASSWORD: "admin",
  DB: "microtek",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
