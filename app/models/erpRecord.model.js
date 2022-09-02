module.exports = (sequelize, Sequelize) => {
  const ErpRecord = sequelize.define("erprecords", {
    UserName: {
      type: Sequelize.STRING
    },
    UserErpId: {
      type: Sequelize.STRING
    },
    UserRank: {
      type: Sequelize.INTEGER
    },
    UserDesignation: {
      type: Sequelize.STRING
    },
    ManagerErpId: {
      type: Sequelize.STRING
    },
    RegionErpId: {
      type: Sequelize.STRING
    },
    IsFieldUser: {
      type: Sequelize.BOOLEAN
    },
    HQ: {
      type: Sequelize.STRING
    },
    IsOrderBookingAllowed: {
      type: Sequelize.BOOLEAN
    },
    Phone: {
      type: Sequelize.STRING
    },
    Email: {
      type: Sequelize.STRING
    },
    ImeiNo: {
      type: Sequelize.STRING
    },
    DateOfJoining: {
      type: Sequelize.STRING
    },
    DateOfLeaving: {
      type: Sequelize.STRING
    },
    UserType: {
      type: Sequelize.STRING
    },
    UserStatus: {
      type: Sequelize.STRING
    },
    IsNewEntry: {
      type: Sequelize.BOOLEAN
    },
    LastUpdatedAtAsEpochTime: {
      type: Sequelize.INTEGER
    }
  });

  return ErpRecord;
};
