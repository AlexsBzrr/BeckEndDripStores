const CategoryService = require("../services/CategoryService");
const categorySchema = require("../validations/categorySchema");

module.exports = {
  //busca de categorias
  async search(req, res) {
    try {
      let { limit = 12, page = 1, fields, use_in_menu } = req.query;
      limit = parseInt(limit);
      page = parseInt(page);
      const options = {
        where: {},
        attributes: ["id", "name", "slug", "use_in_menu"],
        limit: limit !== -1 ? limit : undefined,
        offset: limit !== -1 ? (page - 1) * limit : undefined,
      };
      if (use_in_menu !== undefined) {
        options.where.use_in_menu = use_in_menu === "true";
      }
      if (fields) {
        options.attributes = fields.split(",").map((f) => f.trim());
      }
      const { rows, count } = await CategoryService.searchCategories(options);
      return res.status(200).json({
        data: rows,
        total: count,
        limit,
        page,
      });
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      return res.status(500).json({
        message: "Erro ao buscar categorias",
        error: error.message,
      });
    }
  },

  async show(req, res) {
    const category = await CategoryService.findCategoryById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Categoria nao encontrada." });
    return res.json({
      id: category.id,
      name: category.name,
      slug: category.slug,
      use_in_menu: category.use_in_menu,
    });
  },

  async store(req, res) {
    try {
      const { error, value } = categorySchema.validate(req.body, {
        stripUnknown: true,
        abortEarly: false,
      });
      if (error) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: error.details.map((detail) => {
            const campo = detail.path.join(".");
            const tipoErro = detail.type;
            switch (tipoErro) {
              case "string.base":
                return `${campo} tem que ser string`;
              case "string.empty":
                return `${campo} não pode estar vazio`;
              case "any.required":
                return `${campo} é obrigatório`;
              case "number.base":
                return `${campo} tem que ser número`;
              default:
                return `${campo}: ${detail.message}`;
            }
          }),
        });
      }
      const category = await CategoryService.createCategory(value);
      return res.status(201).json({
        message: "Categoria criada com sucesso!",
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          use_in_menu: category.use_in_menu,
        },
      });
    } catch (error) {
      console.error("Erro no CategoryController.store:", error);
      console.error("Error stack:", error.stack);
      return res.status(500).json({
        message: "Erro interno do servidor",
        error: error.message,
      });
    }
  },

  async update(req, res) {
    try {
      const { error, value } = categorySchema.validate(req.body, {
        stripUnknown: true,
        abortEarly: false,
      });
      if (error) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: error.details.map((detail) => {
            const campo = detail.path.join(".");
            const tipoErro = detail.type;
            switch (tipoErro) {
              case "string.base":
                return `${campo} tem que ser string`;
              case "string.empty":
                return `${campo} não pode estar vazio`;
              case "any.required":
                return `${campo} é obrigatório`;
              case "number.base":
                return `${campo} tem que ser número`;
              default:
                return `${campo}: ${detail.message}`;
            }
          }),
        });
      }

      const category = await CategoryService.updateCategory(
        req.params.id,
        value
      );
      if (!category) {
        return res.status(404).json({
          message: "Categoria não encontrada.",
        });
      }
      return res.status(200).json({
        message: "Categoria atualizada com sucesso!",
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          use_in_menu: category.use_in_menu,
        },
      });
    } catch (error) {
      console.error("Erro no CategoryController.update:", error);
      console.error("Error stack:", error.stack);
      return res.status(500).json({
        message: "Erro interno do servidor",
        error: error.message,
      });
    }
  },

  async delete(req, res) {
    try {
      const deletedCount = await CategoryService.deleteCategory(req.params.id);

      if (deletedCount === 0) {
        return res.status(404).json({ message: "Categoria não encontrada." });
      }
      return res
        .status(200)
        .json({ message: "Categoria deletada com sucesso." });
    } catch (error) {
      return res.status(500).json({
        message: "Erro ao deletar a categoria.",
        error: error.message,
      });
    }
  },
};
