const CategoryService = require("../services/CategoryService");
const { id, message } = require("../validations/userValidation");

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

  //exibição de categorias pelo id
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

  //criação de categorias
  async store(req, res) {
    const { name, slug, use_in_menu } = req.body;
    try {
      const category = await CategoryService.createCategory(
        name,
        slug,
        use_in_menu
      );
      return res.status(201).send({
        message: "Categoria criada com sucesso!",
        category,
      });
    } catch (error) {
      return res.status(400).send({
        message: "Erro ao criar categoria",
        error: error.message,
      });
    }
  },

  async update(req, res) {
    const { name, slug } = req.body;

    try {
      const category = await CategoryService.updateCategory(
        req.params.id,
        req.body
      );
      if (!category)
        return res.status(404).json({ message: "Categoria nao encontrada." });
      return res.status(200).send({
        message: "Categoria atualizada com sucesso!",
        category: {
          name: category.name,
          slug: category.slug,
          use_in_menu: category.use_in_menu,
        },
      });
    } catch (error) {
      return res.status(400).send({
        message: "Erro ao atualizar a categoria.",
        error: error.message,
      });
    }
  },

  //exclusão de categorias
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

/**
 * @swagger
 * tags:
 *   - name: Categories
 *     description: Operações relacionadas a categorias
 */

/**
 * @swagger
 * /v1/category:
 *   post:
 *     tags:
 *       - Categories
 *     summary: Cria uma nova categoria
 *     description: Cria uma nova categoria no sistema
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Shoes"
 *                 description: "Nome da categoria (obrigatório)"
 *               slug:
 *                 type: string
 *                 example: "shoes"
 *                 description: "Slug único da categoria (obrigatório)"
 *               use_in_menu:
 *                 type: boolean
 *                 default: false
 *                 example: true
 *                 description: "Define se a categoria aparece no menu"
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Categoria criada com sucesso!"
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Shoes"
 *                     slug:
 *                       type: string
 *                       example: "shoes"
 *                     use_in_menu:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao criar categoria"
 *                 error:
 *                   type: string
 *                   example: "Detalhes do erro de validação"
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Token inválido ou ausente"
 */

/**
 * @swagger
 * /v1/category/search:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Busca categorias com paginação e filtros
 *     description: Retorna uma lista paginada de categorias com opções de filtro
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: "Número máximo de categorias por página (-1 para todas)"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: "Número da página"
 *       - in: query
 *         name: fields
 *         schema:
 *           type: string
 *         example: "name,slug"
 *         description: "Campos específicos para retornar (separados por vírgula)"
 *       - in: query
 *         name: use_in_menu
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: "Filtra categorias que aparecem no menu"
 *     responses:
 *       200:
 *         description: Lista de categorias com informações de paginação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Shoes"
 *                       slug:
 *                         type: string
 *                         example: "shoes"
 *                       use_in_menu:
 *                         type: boolean
 *                         example: true
 *                 total:
 *                   type: integer
 *                   example: 25
 *                 limit:
 *                   type: integer
 *                   example: 12
 *                 page:
 *                   type: integer
 *                   example: 1
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao buscar categorias"
 *                 error:
 *                   type: string
 *                   example: "Detalhes do erro"
 */

/**
 * @swagger
 * /v1/category/{id}:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Busca uma categoria pelo ID
 *     description: Retorna os dados de uma categoria específica
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Shoes"
 *                 slug:
 *                   type: string
 *                   example: "shoes"
 *                 use_in_menu:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Categoria não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Categoria nao encontrada."
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /v1/category/{id}:
 *   put:
 *     tags:
 *       - Categories
 *     summary: Atualiza uma categoria existente
 *     description: Atualiza dados de uma categoria existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da categoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Tênis"
 *               slug:
 *                 type: string
 *                 example: "tenis"
 *               use_in_menu:
 *                 type: boolean
 *                 example: false
 *                 description: "Define se a categoria aparece no menu"
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Categoria atualizada com sucesso!"
 *                 category:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Tênis"
 *                     slug:
 *                       type: string
 *                       example: "tenis"
 *                     use_in_menu:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao atualizar a categoria."
 *                 error:
 *                   type: string
 *                   example: "Detalhes do erro"
 *       404:
 *         description: Categoria não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Categoria nao encontrada."
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /v1/category/{id}:
 *   delete:
 *     tags:
 *       - Categories
 *     summary: Remove uma categoria existente
 *     description: Deleta permanentemente uma categoria do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Categoria deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Categoria deletada com sucesso."
 *       404:
 *         description: Categoria não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Categoria não encontrada."
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao deletar a categoria."
 *                 error:
 *                   type: string
 *                   example: "Detalhes do erro"
 *                   description: "Detalhes do erro (apenas em desenvolvimento)"
 */
