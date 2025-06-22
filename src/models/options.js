const { Model, DataTypes } = require("sequelize");

class Option extends Model {
  // CORRIGIDO: era Product, agora é Option
  static init(sequelize) {
    super.init(
      {
        title: { type: DataTypes.STRING, allowNull: false },
        shape: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: "square",
        },
        radius: { type: DataTypes.STRING, allowNull: false, defaultValue: "4" },
        type: { type: DataTypes.STRING, allowNull: false },
        values: { type: DataTypes.JSON, allowNull: false },
        product_id: { type: DataTypes.INTEGER, allowNull: false },
      },
      {
        sequelize,
        modelName: "Option",
        tableName: "options",
        underscored: true,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product",
    });
  }
}

module.exports = Option; // CORRIGIDO: era Product, agora é Option
