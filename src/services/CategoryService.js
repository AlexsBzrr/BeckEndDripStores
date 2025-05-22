const Category = require("../models/category");

const CategoryService = {
  // Listagem de categorias
  async listCategories() {
    return await Category.findAll();
  },
  // Cria uma nova categoria
  async createCategory(name, slug) {
    return await Category.create({ name, slug });
  },
  // Busca de uma categoria por ID
  async getCategoryById(id) {
    return await Category.findByPk(id);
  },

  // Editar uma categoria
  async updateCategory(id, name, slug) {
    return await Category.update({ name, slug }, { where: { id } });
  },

  // Deletar uma categoria
  async deleteCategory(id) {
    return await Category.destroy({ where: { id } });
  },
};

module.exports = CategoryService;
