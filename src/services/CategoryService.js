const Category = require("../models/category");

const CategoryService = {
  // Listagem de categorias/search
  async searchCategories(params) {
    return await Category.findAndCountAll(params);
  },
  // Cria uma nova categoria
  async createCategory(categoryData) {
    try {
      if (typeof categoryData.name !== "string") {
        throw new Error(
          `Nome deve ser uma string. Recebido: ${typeof categoryData.name}`
        );
      }
      if (typeof categoryData.slug !== "string") {
        throw new Error(
          `Slug deve ser uma string. Recebido: ${typeof categoryData.slug}`
        );
      }
      if (typeof categoryData.use_in_menu !== "boolean") {
        throw new Error(
          `use_in_menu deve ser um boolean. Recebido: ${typeof categoryData.use_in_menu}`
        );
      }
      const sanitizedData = {
        name: categoryData.name.trim(),
        slug: categoryData.slug.trim(),
        use_in_menu: categoryData.use_in_menu,
      };
      const existingCategory = await Category.findOne({
        where: { name: sanitizedData.name },
      });
      if (existingCategory) {
        throw new Error("Já existe uma categoria com este nome");
      }
      const category = await Category.create(sanitizedData);
      return category;
    } catch (error) {
      console.error("Erro no CategoryService.createCategory:", error);
      throw error;
    }
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
