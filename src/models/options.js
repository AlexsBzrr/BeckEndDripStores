const { Model, DataTypes } = require("sequelize");

class Option extends Model {
  static init(sequelize) {
    return super.init(
      {
        title: DataTypes.STRING,
        shape: DataTypes.STRING,
        radius: DataTypes.STRING,
        type: DataTypes.STRING,
        // value: DataTypes.JSON, // Para armazenar arrays
        values: DataTypes.JSON, // Para armazenar arrays
        ProductId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "products",
            key: "id",
          },
        },
      },
      {
        sequelize,
        modelName: "Option",
        tableName: "options",
        timestamps: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Product, { foreignKey: "ProductId", as: "product" });
  }
}

module.exports = Option;
