module.exports = {
    HOST: "192.168.1.13",
    USER: "frtapi",
    PASSWORD: "mipl@2022",
    DB: "etimetracklite1",
    dialect: "mssql",
    timeZone: 'ist',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};