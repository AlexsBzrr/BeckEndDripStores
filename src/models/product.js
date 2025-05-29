// // // src/models/product.js
// // const { Model, DataTypes } = require("sequelize");

// // class Product extends Model {
// //   static init(sequelize) {
// //     return super.init(
// //       {
// //         enabled: {
// //           type: DataTypes.BOOLEAN,
// //           defaultValue: true,
// //         },
// //         name: DataTypes.STRING,
// //         slug: DataTypes.STRING,
// //         stock: DataTypes.INTEGER,
// //         description: DataTypes.TEXT,
// //         price: DataTypes.FLOAT,
// //         price_with_discount: DataTypes.FLOAT,
// //       },
// //       {
// //         sequelize,
// //         modelName: "Product",
// //         tableName: "products",
// //         timestamps: true,
// //       }
// //     );
// //   }

// //   // Métodos de associação
// //   static associate(models) {
// //     this.belongsToMany(models.Category, {
// //       through: "ProductCategory",
// //       as: "Categories",
// //       foreignKey: "ProductId",
// //     });
// //     this.hasMany(models.Image, { foreignKey: "ProductId", as: "images" });
// //     this.hasMany(models.Option, { foreignKey: "ProductId", as: "options" });
// //   }
// // }

// // module.exports = Product;

// const { Model, DataTypes } = require("sequelize");

// class Product extends Model {
//   static init(sequelize) {
//     return super.init(
//       {
//         enabled: {
//           type: DataTypes.BOOLEAN,
//           defaultValue: true,
//         },
//         name: DataTypes.STRING,
//         slug: DataTypes.STRING,
//         stock: DataTypes.INTEGER,
//         description: DataTypes.TEXT,
//         price: DataTypes.FLOAT,
//         price_with_discount: DataTypes.FLOAT,
//       },
//       {
//         sequelize,
//         modelName: "Product",
//         tableName: "products",
//         timestamps: true,
//       }
//     );
//   }

//   // Métodos de associação
//   static associate(models) {
//     this.belongsToMany(models.Category, {
//       through: "ProductCategory",
//       as: "Categories",
//       foreignKey: "product_id",
//       otherKey: "category_id",
//     });
//     this.hasMany(models.Image, {
//       foreignKey: "product_id",
//       as: "images",
//     });
//     this.hasMany(models.Option, {
//       foreignKey: "product_id", // Confirme se esta coluna existe na tabela options
//       as: "options",
//     });
//   }
// }

// module.exports = Product;

const { Model, DataTypes } = require("sequelize");

class Product extends Model {
  static init(sequelize) {
    return super.init(
      {
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
        },
        price: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        price_with_discount: {
          type: DataTypes.FLOAT,
        },
        stock: {
          type: DataTypes.INTEGER,
        },
        enabled: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        slug: {
          type: DataTypes.STRING,
        },
      },
      {
        sequelize,
        modelName: "Product",
        tableName: "products",
        timestamps: true,
      }
    );
  }

  static associate(models) {
    // Associação principal para carregar os dados
    this.belongsToMany(models.Category, {
      through: "ProductCategory",
      as: "Categories",
      foreignKey: "product_id",
      otherKey: "category_id",
    });

    // Associação secundária para filtros
    this.belongsToMany(models.Category, {
      through: "ProductCategory",
      as: "FilterCategories",
      foreignKey: "product_id",
      otherKey: "category_id",
    });
    this.hasMany(models.Image, {
      foreignKey: "product_id",
      as: "images",
    });
    this.hasMany(models.Option, {
      foreignKey: "ProductId",
      as: "options", // esse alias deve ser usado no include
    });
  }
}

module.exports = Product;
