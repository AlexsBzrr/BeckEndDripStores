const Category = require("../models/category");

module.exports = {
  async index(req, res) {
    const categories = await Category.findAll();
    return res.json(categories);
  },

  //criação de categorias
  async store(req, res) {
    const category = await Category.create(req.body);
    return res.status(200).send({
      message: "Categoria criado com sucesso!",
      category,
    });
  },

  async show(req, res) {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    return res.json(category);
  },

  async update(req, res) {
    const { id } = req.params;
    await Category.update(req.body, {
      where: {
        id,
      },
    });
    const category = await Category.findByPk(id);
    return res.status(200).send({
      message: "Categoria atualizado com sucesso!",
      category,
    });
  },

  async delete(req, res) {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    return res.json(category);
  },
};

// Documentação da API
/**
 * @swagger
 * tags:
 *   - name: Category
 *     description: Operações relacionadas a categorias
 */
/**
 * @swagger
 * /v1/category:
 *   post:
 *     tags:
 *       - Category
 *     summary: Cria uma nova categoria
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
 *               - use_in_menu
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Shoes"
 *               slug:
 *                 type: string
 *                 example: "shoes"
 *               use_in_menu:
 *                 type: boolean
 *                 example: true
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
 *                   example: "Categoria cadastrada com sucesso!"
 *       400:
 *         description: Erro nos dados enviados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Dados inválidos ou incompletos"
 *                 error:
 *                   type: string
 *                   example: "Campo inválido enviado"
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
 * /v1/category/{id}:
 *   put:
 *     tags:
 *       - Category
 *     summary: Atualiza uma categoria existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *               - use_in_menu
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Tênis"
 *               slug:
 *                 type: string
 *                 example: "tenis"
 *               use_in_menu:
 *                 type: boolean
 *                 example: true
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
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Categoria não encontrada
 *
 *   delete:
 *     tags:
 *       - Category
 *     summary: Deleta uma categoria
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da categoria
 *     responses:
 *       204:
 *         description: Categoria deletada com sucesso (sem conteúdo)
 *       404:
 *         description: Categoria não encontrada
 */

/**
 * @swagger
 * /v1/category:
 *   get:
 *     tags:
 *       - Category
 *     summary: Retorna a lista de categorias
 *     description: Retorna todas as categorias cadastradas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Shoes"
 *                   slug:
 *                     type: string
 *                     example: "shoes"
 *                   use_in_menu:
 *                     type: boolean
 *                     example: true
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
 * /v1/category/{id}:
 *   get:
 *     tags:
 *       - Category
 *     summary: Busca uma categoria pelo ID
 *     description: Retorna os dados de uma categoria específica
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
 *         description: Categoria encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
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
 *                   example: "Categoria não encontrada"
 *       401:
 *         description: Não autorizado
 */
