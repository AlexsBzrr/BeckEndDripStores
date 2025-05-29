// // // src/models/category.js
// // const { Model, DataTypes } = require("sequelize");

// // class Category extends Model {
// //   static init(sequelize) {
// //     return super.init(
// //       {
// //         name: {
// //           type: DataTypes.STRING,
// //           allowNull: false,
// //           unique: true,
// //         },
// //         slug: {
// //           type: DataTypes.STRING,
// //         },
// //         use_in_menu: {
// //           type: DataTypes.BOOLEAN,
// //           defaultValue: false,
// //         },
// //       },
// //       {
// //         sequelize,
// //         modelName: "Category",
// //         tableName: "categories",
// //         timestamps: true,
// //       }
// //     );
// //   }

// //   static associate(models) {
// //     this.belongsToMany(models.Product, {
// //       through: "ProductCategory",
// //       as: "Products",
// //       foreignKey: "CategoryId",
// //     });
// //   }
// // }

// // module.exports = Category;

// const { Model, DataTypes } = require("sequelize");

// class Category extends Model {
//   static init(sequelize) {
//     return super.init(
//       {
//         name: {
//           type: DataTypes.STRING,
//           allowNull: false,
//           unique: true,
//         },
//         slug: {
//           type: DataTypes.STRING,
//         },
//         use_in_menu: {
//           type: DataTypes.BOOLEAN,
//           defaultValue: false,
//         },
//       },
//       {
//         sequelize,
//         modelName: "Category",
//         tableName: "categories",
//         timestamps: true,
//       }
//     );
//   }

//   static associate(models) {
//     this.belongsToMany(models.Product, {
//       through: "ProductCategory",
//       as: "Products",
//       foreignKey: "category_id",
//       otherKey: "product_id",
//     });
//   }
// }

// module.exports = Category;

const { Model, DataTypes } = require("sequelize");

class Category extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        slug: {
          type: DataTypes.STRING,
        },
        use_in_menu: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
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
      foreignKey: "category_id",
      otherKey: "product_id",
    });
  }
}

module.exports = Category;
