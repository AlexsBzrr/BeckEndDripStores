// // src/models/image.js
// const { Model, DataTypes } = require("sequelize");

// class Image extends Model {
//   static init(sequelize) {
//     return super.init(
//       {
//         type: DataTypes.STRING,
//         content: DataTypes.TEXT("long"),
//         ProductId: {
//           type: DataTypes.INTEGER,
//           allowNull: false,
//           references: {
//             model: "products",
//             key: "id",
//           },
//         },
//       },
//       {
//         sequelize,
//         modelName: "Image",
//         tableName: "images",
//         timestamps: true,
//       }
//     );
//   }

//   static associate(models) {
//     this.belongsTo(models.Product, { foreignKey: "ProductId", as: "product" });
//   }
// }

// module.exports = Image;
// src/models/image.js

// const { Model, DataTypes } = require("sequelize");

// class Image extends Model {
//   static init(sequelize) {
//     return super.init(
//       {
//         path: {
//           type: DataTypes.STRING,
//           allowNull: false,
//         },
//         enabled: {
//           type: DataTypes.BOOLEAN,
//           defaultValue: false,
//         },
//         ProductId: {
//           type: DataTypes.INTEGER,
//           allowNull: false,
//           references: {
//             model: "products",
//             key: "id",
//           },
//         },
//       },
//       {
//         sequelize,
//         modelName: "Image",
//         tableName: "images",
//         timestamps: true,
//         underscored: true, // para usar snake_case no banco (product_id)
//       }
//     );
//   }

//   static associate(models) {
//     this.belongsTo(models.Product, { foreignKey: "ProductId", as: "product" });
//   }
// }

// module.exports = Image;

const { Model, DataTypes } = require("sequelize");

class Image extends Model {
  static init(sequelize) {
    return super.init(
      {
        path: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        enabled: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        product_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "Image",
        tableName: "images",
        underscored: true,
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Product, {
      foreignKey: "product_id",
      as: "product",
    });
  }
}

module.exports = Image;
