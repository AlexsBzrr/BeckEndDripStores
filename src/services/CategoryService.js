const Category = require("../models/category");

const CategoryService = {
  // Listagem de categorias/search
  async searchCategories(params) {
    return await Category.findAndCountAll(params);
  },
  // Cria uma nova categoria
  async createCategory(name, slug, use_in_menu = false) {
    return await Category.create({ name, slug, use_in_menu });
  },
  // Busca de uma categoria por ID
  async findCategoryById(id) {
    return await Category.findByPk(id);
  },

  // Editar uma categoria
  async updateCategory(id, data) {
    await Category.update(data, { where: { id } });
    return await Category.findByPk(id);
  },

  // Deletar uma categoria
  async deleteCategory(id) {
    return await Category.destroy({ where: { id } });
  },
};

module.exports = CategoryService;
