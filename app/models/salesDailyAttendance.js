module.exports = (sequelize, Sequelize) => {
    const SalesDailyAttendance = sequelize.define("sales_dailyattendance", {
      employee_id: {
        type: Sequelize.STRING
      },
      InTime: {
        type: Sequelize.DATE
      },
      OutTime: {
        type: Sequelize.DATE
      }
    });
  
    return SalesDailyAttendance;
  };
  