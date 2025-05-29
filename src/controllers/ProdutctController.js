const Product = require("../models/product");
const Category = require("../models/category");
const Image = require("../models/images");
const Option = require("../models/options");
const { Op, Sequelize } = require("sequelize");
const updateProductSchema = require("../validations/updateProductSchema");

module.exports = {
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

      let options = [];
      if (req.body.options) {
        if (typeof req.body.options === "string") {
          options = JSON.parse(req.body.options);
        } else if (Array.isArray(req.body.options)) {
          options = req.body.options;
        }
      }

      const images = req.files;

      if (!name) {
        await transaction.rollback();
        return res.status(400).json({ error: "Name is required" });
      }

      let finalSlug = slug;
      if (!finalSlug) {
        finalSlug = name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-");

        const existingProduct = await Product.findOne({
          where: { slug: finalSlug },
          transaction,
        });

        if (existingProduct) {
          const timestamp = Date.now();
          finalSlug = `${finalSlug}-${timestamp}`;
        }
      }

      const productData = {
        enabled: enabled !== undefined ? enabled : true,
        name,
        slug: finalSlug,
        stock: stock !== undefined ? stock : 0,
        description: description || "",
        price: price || 0,
        price_with_discount: price_with_discount || null,
      };

      console.log("Creating product with data:", productData);
      const product = await Product.create(productData, { transaction });

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
      return res.status(201).json({
        message: "Produto cadastrado com sucesso!",
        id: product.id,
        name: product.name,
        slug: product.slug,
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Erro ao salvar produto:", error);
      return res.status(500).json({ error: error.message });
    }
  },
  // Busca produtos
  async search(req, res) {
    try {
      const {
        limit = 12,
        page = 1,
        fields,
        match,
        category_ids,
        "price-range": priceRange,
        ...optionsQuery
      } = req.query;

      const parsedLimit = parseInt(limit);
      const parsedPage = parseInt(page);
      const offset =
        parsedLimit > 0 ? (parsedPage - 1) * parsedLimit : undefined;

      const validProductAttributes = [
        "id",
        "enabled",
        "name",
        "slug",
        "stock",
        "description",
        "price",
        "price_with_discount",
      ];
      const attributes = fields
        ? fields
            .split(",")
            .filter((field) => validProductAttributes.includes(field.trim()))
        : validProductAttributes;

      const where = {};
      if (match) {
        where[Op.or] = [
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("Product.name")),
            {
              [Op.like]: `%${match.toLowerCase()}%`,
            }
          ),
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("Product.description")),
            {
              [Op.like]: `%${match.toLowerCase()}%`,
            }
          ),
        ];
      }

      if (priceRange) {
        const [min, max] = priceRange.split("-").map(Number);
        where.price = { [Op.between]: [min, max] };
      }

      const categoryFilterForWhere = category_ids
        ? {
            model: Category,
            as: "FilterCategories",
            attributes: [],
            where: {
              id: {
                [Op.in]: category_ids.split(",").map(Number),
              },
            },
            through: { attributes: [] },
            required: true,
          }
        : null;

      const categoryInclude = {
        model: Category,
        as: "Categories",
        attributes: ["id"],
        through: { attributes: [] },
        required: false,
      };

      // Filtro por opções (option[45]=PP,GG)
      const optionFilters = [];
      for (const key in optionsQuery) {
        const match = key.match(/^option\[(\d+)\]$/);
        if (match) {
          const optionId = parseInt(match[1]);
          const values = optionsQuery[key].split(",");
          optionFilters.push({
            id: optionId,
            values: { [Op.in]: values },
          });
        }
      }

      const include = [
        {
          model: Image,
          as: "images",
          attributes: ["id", "path"],
          required: false,
        },
        {
          model: Option,
          as: "options",
          where: optionFilters.length ? { [Op.or]: optionFilters } : undefined,
          required: optionFilters.length > 0,
          attributes: [
            "id",
            "title",
            "shape",
            "radius",
            "type",
            "values",
            "product_id",
          ],
        },
        categoryInclude,
      ];
      if (categoryFilterForWhere) {
        include.push(categoryFilterForWhere);
      }

      const totalCount = await Product.count({
        where,
        include: include.map((inc) => ({
          ...inc,
          attributes: [],
        })),
        distinct: true,
      });

      const products = await Product.findAll({
        where,
        attributes,
        include,
        limit: parsedLimit > 0 ? parsedLimit : undefined,
        offset: parsedLimit > 0 ? offset : undefined,
        order: [["id", "ASC"]],
      });

      const mappedData = products.map((product) => {
        const productJson = product.toJSON();

        const categoryIds = productJson.Categories
          ? productJson.Categories.map((category) => category.id)
          : [];

        delete productJson.Categories;
        productJson.category_ids = categoryIds;

        return productJson;
      });

      return res.json({
        data: mappedData,
        total: totalCount,
        limit: parsedLimit > 0 ? parsedLimit : -1,
        page: parsedPage > 0 ? parsedPage : 1,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  },
  // visualizar um produto especifico pelo id
  async show(req, res) {
    const { id } = req.params;
    try {
      const product = await Product.findByPk(id, {
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
        include: [
          {
            association: "images",
            attributes: ["id", "path"],
          },
          {
            association: "options",
            attributes: [
              "id",
              "title",
              "shape",
              "radius",
              "type",
              "values",
              "product_id",
            ],
          },
          {
            association: "Categories",
            attributes: ["id"],
            through: { attributes: [] },
          },
        ],
      });

      if (!product) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }

      const productJson = product.toJSON();

      const categoryIds = productJson.Categories
        ? productJson.Categories.map((cat) => cat.id)
        : [];

      delete productJson.Categories;
      productJson.category_ids = categoryIds;

      return res.json({ product: productJson });
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      return res
        .status(500)
        .json({ error: error.message, message: "Erro ao buscar produto" });
    }
  },

  // atualizar um produto
  async update(req, res) {
    const { id } = req.params;
    const productId = Number(id);
    const transaction = await Product.sequelize.transaction();

    // Validação com schema Joi
    const { error, value } = updateProductSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      await transaction.rollback();
      return res.status(400).json({
        error: "Dados inválidos",
        details: error.details.map((e) => e.message),
      });
    }

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
        options: rawOptions,
      } = value;

      const updatedFields = {
        ...(enabled !== undefined && { enabled }),
        ...(name && { name }),
        ...(slug && { slug }),
        ...(stock !== undefined && { stock }),
        ...(description && { description }),
        ...(price !== undefined && { price }),
        ...(price_with_discount !== undefined && { price_with_discount }),
      };

      // Parse das opções
      let options = [];
      if (rawOptions) {
        if (typeof rawOptions === "string") {
          options = JSON.parse(rawOptions);
        } else {
          options = rawOptions;
        }
      }

      const images = req.files;

      const [updated] = await Product.update(updatedFields, {
        where: { id: productId },
        transaction,
      });

      if (!updated) {
        await transaction.rollback();
        return res.status(404).json({ error: "Produto não encontrado" });
      }

      const product = await Product.findByPk(productId, { transaction });

      // Atualiza categorias
      if (category_ids && category_ids.length > 0) {
        const categories = await Category.findAll({
          where: { id: category_ids },
          transaction,
        });
        await product.setCategories(categories, { transaction });
      }

      // Atualiza imagens
      if (images && images.length > 0) {
        await Image.destroy({ where: { ProductId: productId }, transaction });

        const novasImagens = images.map((file) => ({
          path: `/uploads/${file.filename}`,
          enabled: true,
          ProductId: productId,
        }));
        await Image.bulkCreate(novasImagens, { transaction });
      }

      // Atualiza opções
      if (Array.isArray(options) && options.length > 0) {
        await Option.destroy({ where: { ProductId: productId }, transaction });

        const novasOpcoes = options.map((opt) => ({
          ...opt,
          ProductId: productId,
          values:
            typeof opt.values === "string"
              ? opt.values
              : JSON.stringify(opt.values),
        }));
        await Option.bulkCreate(novasOpcoes, { transaction });
      }

      await transaction.commit();

      const updatedProduct = await Product.findByPk(productId, {
        include: [
          {
            model: Image,
            as: "images",
            attributes: ["id", "path"],
          },
          {
            model: Option,
            as: "options",
            attributes: [
              "id",
              "title",
              "shape",
              "radius",
              "type",
              "values",
              "product_id",
            ],
          },
          {
            model: Category,
            as: "Categories",
            attributes: ["id"],
            through: { attributes: [] },
          },
        ],
      });

      const productJson = updatedProduct.toJSON();
      const categoryIds = productJson.Categories?.map((cat) => cat.id) || [];

      delete productJson.Categories;
      productJson.category_ids = categoryIds;

      return res.json({
        message: "Produto atualizado com sucesso",
        product: productJson,
      });
    } catch (err) {
      await transaction.rollback();
      console.error("Erro ao atualizar produto:", err);
      return res
        .status(500)
        .json({ error: "Erro interno ao atualizar produto" });
    }
  },

  // deletar um produto
  async delete(req, res) {
    const { id } = req.params;
    try {
      const deleted = await Product.destroy({ where: { id } });
      if (!deleted)
        return res.status(404).json({ error: "Produto não encontrado" });
      return res.status(200).json({ message: "Produto deletado com sucesso!" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Operações relacionadas a produtos
 */

/**
 * @swagger
 * /v1/product:
 *   post:
 *     tags:
 *       - Products
 *     summary: Cria um novo produto
 *     description: Cria um novo produto com imagens, opções e categorias
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *               name:
 *                 type: string
 *                 example: "Produto Exemplo"
 *                 description: "Nome do produto (obrigatório)"
 *               slug:
 *                 type: string
 *                 example: "produto-exemplo"
 *                 description: "Slug único (gerado automaticamente se não fornecido)"
 *               stock:
 *                 type: integer
 *                 default: 0
 *                 example: 10
 *               description:
 *                 type: string
 *                 default: ""
 *                 example: "Descrição detalhada do produto"
 *               price:
 *                 type: number
 *                 format: float
 *                 default: 0
 *                 example: 119.90
 *               price_with_discount:
 *                 type: number
 *                 format: float
 *                 example: 99.90
 *                 description: "Preço com desconto (opcional)"
 *               category_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 15, 24]
 *                 description: "IDs das categorias associadas"
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "Arquivos de imagem do produto"
 *               options:
 *                 type: string
 *                 example: '[{"title":"Tamanho","shape":"square","radius":"4px","type":"text","values":["P","M","G"]}]'
 *                 description: "JSON string ou array com opções do produto"
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
 *                 name:
 *                   type: string
 *                   example: "Produto Exemplo"
 *                 slug:
 *                   type: string
 *                   example: "produto-exemplo"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Name is required"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
 */

/**
 * @swagger
 * /v1/product/search:
 *   get:
 *     tags:
 *       - Products
 *     summary: Busca produtos com filtros avançados
 *     description: Busca produtos com paginação, filtros por categoria, preço, opções e busca por texto
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: "Limite de produtos por página"
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
 *         example: "id,name,price,slug"
 *         description: "Campos específicos para retornar (separados por vírgula)"
 *       - in: query
 *         name: match
 *         schema:
 *           type: string
 *         example: "bermuda"
 *         description: "Busca por texto no nome ou descrição"
 *       - in: query
 *         name: category_ids
 *         schema:
 *           type: string
 *         example: ""
 *         description: "IDs das categorias (separados por vírgula)"
 *       - in: query
 *         name: price-range
 *         schema:
 *           type: string
 *         example: "200"
 *         description: "Faixa de preço (min-max)"
 *       - in: query
 *         name: option[45]
 *         schema:
 *           type: string
 *         example: "M"
 *         description: "Filtro por opção específica (option[ID_OPCAO]=valores)"
 *     responses:
 *       200:
 *         description: Lista de produtos encontrados
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
 *                       enabled:
 *                         type: boolean
 *                         example: true
 *                       name:
 *                         type: string
 *                         example: "Produto Exemplo"
 *                       slug:
 *                         type: string
 *                         example: "produto-exemplo"
 *                       stock:
 *                         type: integer
 *                         example: 10
 *                       description:
 *                         type: string
 *                         example: "Descrição do produto"
 *                       price:
 *                         type: number
 *                         example: 119.90
 *                       price_with_discount:
 *                         type: number
 *                         example: 99.90
 *                       category_ids:
 *                         type: array
 *                         items:
 *                           type: integer
 *                         example: [1, 2]
 *                       images:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             path:
 *                               type: string
 *                       options:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             title:
 *                               type: string
 *                             shape:
 *                               type: string
 *                             radius:
 *                               type: string
 *                             type:
 *                               type: string
 *                             values:
 *                               type: string
 *                             product_id:
 *                               type: integer
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
 */

/**
 * @swagger
 * /v1/product/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Busca um produto pelo ID
 *     description: Retorna os dados completos de um produto específico
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
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     enabled:
 *                       type: boolean
 *                       example: true
 *                     name:
 *                       type: string
 *                       example: "Produto Exemplo"
 *                     slug:
 *                       type: string
 *                       example: "produto-exemplo"
 *                     stock:
 *                       type: integer
 *                       example: 10
 *                     description:
 *                       type: string
 *                       example: "Descrição do produto"
 *                     price:
 *                       type: number
 *                       example: 119.90
 *                     price_with_discount:
 *                       type: number
 *                       example: 99.90
 *                     category_ids:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [1, 2]
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           path:
 *                             type: string
 *                     options:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           shape:
 *                             type: string
 *                           radius:
 *                             type: string
 *                           type:
 *                             type: string
 *                           values:
 *                             type: string
 *                           product_id:
 *                             type: integer
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Produto não encontrado"
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /v1/product/{id}:
 *   put:
 *     tags:
 *       - Products
 *     summary: Atualiza um produto existente
 *     description: Atualiza dados do produto, incluindo imagens, opções e categorias
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *                 example: true
 *               name:
 *                 type: string
 *                 example: "Produto Atualizado"
 *               slug:
 *                 type: string
 *                 example: "produto-atualizado"
 *               stock:
 *                 type: integer
 *                 example: 5
 *               description:
 *                 type: string
 *                 example: "Nova descrição do produto"
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 129.90
 *               price_with_discount:
 *                 type: number
 *                 format: float
 *                 example: 109.90
 *               category_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 3, 5]
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "Novas imagens (substituem as existentes)"
 *               options:
 *                 type: string
 *                 example: '[{"title":"Cor","type":"text","values":["Azul","Verde"]}]'
 *                 description: "Novas opções (substituem as existentes)"
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Produto atualizado com sucesso"
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     enabled:
 *                       type: boolean
 *                       example: true
 *                     name:
 *                       type: string
 *                       example: "Produto Atualizado"
 *                     slug:
 *                       type: string
 *                       example: "produto-atualizado"
 *                     stock:
 *                       type: integer
 *                       example: 5
 *                     description:
 *                       type: string
 *                       example: "Nova descrição do produto"
 *                     price:
 *                       type: number
 *                       example: 129.90
 *                     price_with_discount:
 *                       type: number
 *                       example: 109.90
 *                     category_ids:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [1, 3, 5]
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                     options:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Dados inválidos"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["name must be a string"]
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Produto não encontrado"
 *       500:
 *         description: Erro interno do servidor
 */

/**
 * @swagger
 * /v1/product/{id}:
 *   delete:
 *     tags:
 *       - Products
 *     summary: Remove um produto existente
 *     description: Deleta permanentemente um produto do sistema
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
 *         description: Produto deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Produto deletado com sucesso!"
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Produto não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Database error"
 *                   description: "Detalhes do erro (apenas em desenvolvimento)"
 *                 message:
 *                   type: string
 *                   example: "Erro interno do servidor"
 */
