const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
class User extends Model {
  static init(sequelize) {
    return super.init(
      {
        firstname: DataTypes.STRING,
        surname: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        islogged: DataTypes.BOOLEAN,
      },
      {
        sequelize,
        hooks: {
          beforeCreate: async (user) => {
            const salt = await bcrypt.genSaltSync();
            user.password = await bcrypt.hashSync(user.password, salt);
          },
        },
        modelName: "User",
        tableName: "users",
      }
    );
  }
}

module.exports = User;
