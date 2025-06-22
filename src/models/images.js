const { Model, DataTypes } = require("sequelize");

class Image extends Model {
  static init(sequelize) {
    super.init(
      {
        path: { type: DataTypes.STRING, allowNull: false },
        enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
        product_id: { type: DataTypes.INTEGER, allowNull: false },
      },
      {
        sequelize,
        modelName: "Image",
        tableName: "images",
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

module.exports = Image;
