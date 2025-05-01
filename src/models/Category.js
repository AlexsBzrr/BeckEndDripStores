const { Model, DataTypes } = require("sequelize");
class Category extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: DataTypes.STRING,
        slug: DataTypes.STRING,
        use_in_menu: DataTypes.BOOLEAN,
      },
      {
        sequelize,
        modelName: "Category",
        tableName: "categories",
      }
    );
  }
}

module.exports = Category;
