"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("product_options", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      shape: {
        type: Sequelize.ENUM("square", "circle"),
        allowNull: true,
        defaultValue: "square",
      },
      radius: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      type: {
        type: Sequelize.ENUM("text", "color"),
        allowNull: true,
        defaultValue: "text",
      },
      values: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // Adicionando um índice para melhorar o desempenho das consultas por product_id
    await queryInterface.addIndex("product_options", ["product_id"]);
  },

  down: async (queryInterface, Sequelize) => {
    // Primeiro removemos a tabela
    await queryInterface.dropTable("product_options");

    // Depois removemos os tipos ENUM personalizados que foram criados
    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS enum_product_options_shape;"
    );
    await queryInterface.sequelize.query(
      "DROP TYPE IF EXISTS enum_product_options_type;"
    );
  },
};
