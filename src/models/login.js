// models/Login.js

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
