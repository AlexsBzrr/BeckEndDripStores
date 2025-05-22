// src/models/category.js
const { Model, DataTypes } = require("sequelize");

class Category extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: DataTypes.STRING,
        slug: DataTypes.STRING,
      },
      {
        sequelize,
        modelName: "Category",
        tableName: "categories",
        timestamps: true,
      }
    );
  }

  static associate(models) {
    this.belongsToMany(models.Product, {
      through: "ProductCategory",
      as: "Products",
      foreignKey: "CategoryId",
    });
  }
}

module.exports = Category;
