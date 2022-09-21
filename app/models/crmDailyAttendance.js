module.exports = (sequelize, Sequelize) => {
    const CRMDailyAttendance = sequelize.define("crm_dailyattendance", {
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
  
    return CRMDailyAttendance;
  };
  