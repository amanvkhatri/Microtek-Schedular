module.exports = (sequelize, Sequelize) => {
    const DailyAttendance = sequelize.define("dailyattendance", {
      UserErpId: {
        type: Sequelize.STRING
      },
      DayStartType: {
        type: Sequelize.INTEGER
      },
      DayStart: {
        type: Sequelize.DATE
      },
      DayEnd: {
        type: Sequelize.DATE
      },
      Date: {
        type: Sequelize.STRING
      },
    });
  
    return DailyAttendance;
  };
  