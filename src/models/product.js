const { Model, DataTypes } = require("sequelize");

class Product extends Model {
  static init(sequelize) {
    super.init(
      {
        name: { type: DataTypes.STRING, allowNull: false, unique: true },
        slug: { type: DataTypes.STRING, allowNull: false, unique: true },
        description: DataTypes.TEXT,
        price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
        price_with_discount: DataTypes.FLOAT,
        stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
      },
      {
        sequelize,
        modelName: "Product",
        tableName: "products",
        underscored: true,
      }
    );
    return this;
  }

  static associate(models) {
    this.hasMany(models.Image, {
      foreignKey: "product_id",
      as: "images",
    });
    this.hasMany(models.Option, {
      foreignKey: "product_id",
      as: "options",
    });
    this.belongsToMany(models.Category, {
      through: "ProductCategory",
      foreignKey: "product_id",
      otherKey: "category_id",
      as: "categories",
    });
  }
}

module.exports = Product;
