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

        await images.bulkCreate(imagensValidas, { transaction });
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
