const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductCategory extends Model {
    static associate(models) {
      // define association here
    }
  }
  ProductCategory.init(
    {
      ProductId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "Products",
          key: "id",
        },
      },
      CategoryId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "Categories",
          key: "id",
        },
      },
    },
    {
      sequelize,
      modelName: "ProductCategory",
      tableName: "ProductCategory",
      timestamps: false,
    }
  );
  return ProductCategory;
};
