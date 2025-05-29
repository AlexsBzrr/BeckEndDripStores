const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class ProductCategory extends Model {
    static associate(models) {
      // Define as associações para os modelos Product e Category
      ProductCategory.belongsTo(models.Product, { foreignKey: "product_id" });
      ProductCategory.belongsTo(models.Category, { foreignKey: "category_id" });
    }
  }

  ProductCategory.init(
    {
      product_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "products",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: "categories",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "ProductCategory",
      tableName: "productCategory", // ou "product_category" se for o nome real da tabela
      timestamps: false,
    }
  );

  return ProductCategory;
};
