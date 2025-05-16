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
            // Gerando o salt de forma assíncrona
            const salt = await bcrypt.genSalt(10); // 10 é o número de rounds de salt
            // Criptografando a senha de forma assíncrona
            user.password = await bcrypt.hash(user.password, salt);
          },
        },
        modelName: "User",
        tableName: "users",
      }
    );
  }
}

module.exports = User;
