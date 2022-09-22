module.exports = (sequelize, Sequelize) => {
    const DailyRecord = sequelize.define("dailytasks", {
      UserErpId: {
        type: Sequelize.STRING
      },
      PunchDate: {
        type: Sequelize.STRING
      },
      TransactionId: {
        type: Sequelize.STRING
      },
      DayStartType: {
        type: Sequelize.INTEGER
      },
      InTime: {
        type: Sequelize.DATE
      },
      Latitude: {
        type: Sequelize.STRING
      },
      ActivityType: {
        type: Sequelize.STRING
      },
      OutTime: {
        type: Sequelize.DATE
      },
      Longitude: {
        type: Sequelize.STRING
      },
    });
  
    return DailyRecord;
  };
  