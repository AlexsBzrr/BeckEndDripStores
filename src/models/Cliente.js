const { Model, DataTypes } = require("sequelize");

class Cliente extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            len: [3, 100],
          },
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isEmail: true,
          },
        },
        cpf: {
          type: DataTypes.STRING(11),
          allowNull: false,
          unique: true,
        },
        telefone: {
          type: DataTypes.STRING(11),
          allowNull: true,
        },
        endereco: DataTypes.STRING,
        bairro: DataTypes.STRING,
        cidade: DataTypes.STRING,
        cep: DataTypes.STRING,
        complemento: DataTypes.STRING,
        password: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null,
        },
      },
      {
        sequelize,
        modelName: "Cliente",
        tableName: "clientes",
      }
    );
  }
}

module.exports = Cliente;
