// Migration para criar a tabela ProductCategory
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("ProductCategory", {
      ProductId: {
        type: Sequelize.INTEGER,
        references: {
          model: "products", // Tabela Products
          key: "id",
        },
        onDelete: "CASCADE",
      },
      CategoryId: {
        type: Sequelize.INTEGER,
        references: {
          model: "categories", // Tabela Categories
          key: "id",
        },
        onDelete: "CASCADE",
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("ProductCategory");
  },
};
