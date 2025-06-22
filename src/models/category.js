const { Model, DataTypes } = require("sequelize");

class Category extends Model {
  static init(sequelize) {
    super.init(
      {
        name: { type: DataTypes.STRING, allowNull: false },
        slug: { type: DataTypes.STRING, allowNull: false },
        use_in_menu: { type: DataTypes.BOOLEAN, defaultValue: false },
      },
      {
        sequelize,
        modelName: "Category",
        tableName: "categories",
        underscored: true,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsToMany(models.Product, {
      through: "ProductCategory",
      foreignKey: "category_id",
      otherKey: "product_id",
      as: "products",
    });
  }
}

module.exports = Category;
