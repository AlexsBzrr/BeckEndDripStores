const Product = require("../models/product"); // Corrigido o nome do arquivo 'product.js'
const Category = require("../models/category"); // Corrigido o nome do arquivo 'category.js'
const Images = require("../models/images");
const Option = require("../models/options");
const { Op } = require("sequelize");

module.exports = {
  async index(req, res) {
    try {
      const products = await Product.findAll({
        include: ["images", "options", "Categories"], // Inclusões de associações
      });
      return res.json(products);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async store(req, res) {
    const transaction = await Product.sequelize.transaction();

    try {
      const {
        enabled,
        name,
        slug,
        stock,
        description,
        price,
        price_with_discount,
        category_ids,
      } = req.body;

      // options pode vir como string se for enviado como JSON em campo form-data
      let options = [];
      if (req.body.options) {
        if (typeof req.body.options === "string") {
          options = JSON.parse(req.body.options);
        } else if (Array.isArray(req.body.options)) {
          options = req.body.options;
        }
      }

      const images = req.files; // multer envia os arquivos aqui

      // Criando o produto
      const product = await Product.create(
        {
          enabled,
          name,
          slug,
          stock,
          description,
          price,
          price_with_discount,
        },
        { transaction }
      );

      // Associando categorias
      if (category_ids && category_ids.length > 0) {
        const categories = await Category.findAll({
          where: { id: category_ids },
          transaction,
        });
        await product.addCategories(categories, { transaction });
      }

      // Criando imagens
      if (images && images.length > 0) {
        const imagensValidas = images.map((file) => ({
          path: `/uploads/${file.filename}`,
          enabled: true,
          ProductId: product.id,
        }));

        await Images.bulkCreate(imagensValidas, { transaction });
      }

      // Criando opções
      if (Array.isArray(options) && options.length > 0) {
        const opcoesValidas = options.map((opt) => ({
          ...opt,
          ProductId: product.id,
        }));

        await Option.bulkCreate(opcoesValidas, { transaction });
      }

      await transaction.commit();
      return res
        .status(201)
        .json({ message: "Produto cadastrado com sucesso!", id: product.id });
    } catch (error) {
      await transaction.rollback();
      console.error("Erro ao salvar produto:", error); // 👈 AJUDA A VER NO TERMINAL
      return res.status(500).json({ error: error.message });
    }
  },

  async show(req, res) {
    const { id } = req.params;
    try {
      const product = await Product.findByPk(id, {
        include: ["images", "options", "Categories"], // Incluindo dados relacionados
      });
      return res.json(product);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    const { id } = req.params;
    try {
      const [updated] = await Product.update(req.body, { where: { id } });
      if (!updated)
        return res.status(404).json({ error: "Produto não encontrado" });

      const updatedProduct = await Product.findByPk(id, {
        include: ["images", "options", "Categories"], // Incluindo dados relacionados após atualização
      });

      return res.json({
        message: "Produto atualizado com sucesso",
        product: updatedProduct,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    const { id } = req.params;
    try {
      const deleted = await Product.destroy({ where: { id } });
      if (!deleted)
        return res.status(404).json({ error: "Produto não encontrado" });
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async search(req, res) {
    const { name } = req.params;
    try {
      const products = await Product.findAll({
        where: { name: { [Op.iLike]: `%${name}%` } },
        include: ["images", "options", "Categories"], // Incluindo dados relacionados
      });
      return res.json(products);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async searchCategory(req, res) {
    const { category } = req.params;
    try {
      const products = await Product.findAll({
        include: [
          {
            model: Category,
            where: { name: { [Op.iLike]: `%${category}%` } },
          },
        ],
      });
      return res.json(products);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

/**
 * @swagger
 * /v1/product:
 *   post:
 *     tags:
 *       - Products
 *     summary: Cria um novo produto
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
 *               - price
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 example: true
 *               name:
 *                 type: string
 *                 example: "Produto 01"
 *               slug:
 *                 type: string
 *                 example: "produto-01"
 *               stock:
 *                 type: integer
 *                 example: 10
 *               description:
 *                 type: string
 *                 example: "Descrição do produto 01"
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 119.90
 *               price_with_discount:
 *                 type: number
 *                 format: float
 *                 example: 99.90
 *               category_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 15, 24, 68]
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: "image/png"
 *                     content:
 *                       type: string
 *                       example: "base64 da imagem"
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "Cor"
 *                     shape:
 *                       type: string
 *                       example: "square"
 *                     radius:
 *                       type: string
 *                       example: "4px"
 *                     type:
 *                       type: string
 *                       example: "text"
 *                     value:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["PP", "GG", "M"]
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Produto cadastrado com sucesso!"
 *                 id:
 *                   type: integer
 *                   example: 42
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
/**
 * @swagger
 * /v1/product:
 *   get:
 *     tags:
 *       - Products
 *     summary: Lista todos os produtos
 *     description: Retorna todos os produtos cadastrados
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de produtos
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
 *                     example: "Produto 01"
 *                   slug:
 *                     type: string
 *                     example: "produto-01"
 *                   price:
 *                     type: number
 *                     example: 119.9
 *                   price_with_discount:
 *                     type: number
 *                     example: 99.9
 *       401:
 *         description: Não autorizado
 */
/**
 * @swagger
 * v1/product/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Busca um produto pelo ID
 *     description: Retorna os dados de um produto específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado
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
 *                   example: "Produto 01"
 *                 slug:
 *                   type: string
 *                   example: "produto-01"
 *                 price:
 *                   type: number
 *                   example: 119.9
 *       404:
 *         description: Produto não encontrado
 *       401:
 *         description: Não autorizado
 */
/**
 * @swagger
 * /v1/product/{id}:
 *   put:
 *     tags:
 *       - Products
 *     summary: Atualiza um produto existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Produto Atualizado"
 *               slug:
 *                 type: string
 *                 example: "produto-atualizado"
 *               price:
 *                 type: number
 *                 example: 129.9
 *               stock:
 *                 type: integer
 *                 example: 5
 *               enabled:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Produto não encontrado
 *       401:
 *         description: Não autorizado
 */
/**
 * @swagger
 * /v1/product/{id}:
 *   delete:
 *     tags:
 *       - Products
 *     summary: Remove um produto existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     responses:
 *       204:
 *         description: Produto deletado com sucesso (sem conteúdo)
 *       404:
 *         description: Produto não encontrado
 *       401:
 *         description: Não autorizado
 */
