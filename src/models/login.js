module.exports = (sequelize, DataTypes) => {
  const Login = sequelize.define("Login", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING, // "success" ou "failed"
      allowNull: false,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  Login.associate = function (models) {
    Login.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return Login;
};

/*

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZmlyc3RuYW1lIjoiTHVjYXMiLCJzdXJuYW1lIjoiQWxlZiIsImVtYWlsIjoibHVjYXNhbGVmQGVtYWlsLmNvbS5iciIsImlhdCI6MTc0ODc4ODM5NCwiZXhwIjoxNzQ4ODE3MTk0fQ.QIz43Y0ErpTtqgTczJ-1_m_zrlWVI6DE4ps8tYBjdPo

*/
