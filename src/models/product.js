// src/models/product.js
const { Model, DataTypes } = require("sequelize");

class Product extends Model {
  static init(sequelize) {
    return super.init(
      {
        enabled: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        name: DataTypes.STRING,
        slug: DataTypes.STRING,
        stock: DataTypes.INTEGER,
        description: DataTypes.TEXT,
        price: DataTypes.FLOAT,
        price_with_discount: DataTypes.FLOAT,
      },
      {
        sequelize,
        modelName: "Product",
        tableName: "products",
        timestamps: true,
      }
    );
  }

  // Métodos de associação
  static associate(models) {
    this.belongsToMany(models.Category, {
      through: "ProductCategory",
      as: "Categories",
      foreignKey: "ProductId",
    });
    this.hasMany(models.Image, { foreignKey: "ProductId", as: "images" });
    this.hasMany(models.Option, { foreignKey: "ProductId", as: "options" });
  }
}

module.exports = Product;
