const Product = require("../models/product");
const Category = require("../models/category");
const Image = require("../models/images");
const Option = require("../models/options");
const { Op } = require("sequelize");
const { sequelize } = require("../database");
const updateProductSchema = require("../validations/updateProductSchema");

module.exports = {
  // criar um produto
  async store(req, res) {
    const transaction = await sequelize.transaction();
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

      if (!name || name.trim() === "") {
        await transaction.rollback();
        return res.status(400).json({ error: "Name is required" });
      }

      let options = [];
      if (req.body.options) {
        try {
          if (typeof req.body.options === "string") {
            options = JSON.parse(req.body.options);
          } else if (Array.isArray(req.body.options)) {
            options = req.body.options;
          }
        } catch {
          await transaction.rollback();
          return res.status(400).json({
            error: "Formato inválido para options. Deve ser JSON válido.",
          });
        }
      }

      let parsedCategoryIds = [];
      if (category_ids) {
        try {
          if (typeof category_ids === "string") {
            if (category_ids.startsWith("[")) {
              parsedCategoryIds = JSON.parse(category_ids);
            } else {
              parsedCategoryIds = category_ids
                .split(",")
                .map((id) => parseInt(id.trim()));
            }
          } else if (Array.isArray(category_ids)) {
            parsedCategoryIds = category_ids.map((id) => parseInt(id));
          } else {
            parsedCategoryIds = [parseInt(category_ids)];
          }
          parsedCategoryIds = parsedCategoryIds.filter(
            (id) => !isNaN(id) && id > 0
          );
        } catch {
          await transaction.rollback();
          return res.status(400).json({
            error:
              "Formato inválido para category_ids. Use array de números ou string separada por vírgulas.",
          });
        }
      }

      const parsedPrice = parseFloat(price) || 0;
      const parsedPriceWithDiscount = price_with_discount
        ? parseFloat(price_with_discount)
        : null;

      if (parsedPrice < 0) {
        await transaction.rollback();
        return res.status(400).json({ error: "Price cannot be negative" });
      }

      if (parsedPriceWithDiscount !== null && parsedPriceWithDiscount < 0) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ error: "Price with discount cannot be negative" });
      }

      if (
        parsedPriceWithDiscount !== null &&
        parsedPriceWithDiscount >= parsedPrice
      ) {
        await transaction.rollback();
        return res.status(400).json({
          error: "Price with discount must be lower than regular price",
        });
      }

      const parsedStock = parseInt(stock) || 0;
      if (parsedStock < 0) {
        await transaction.rollback();
        return res.status(400).json({ error: "Stock cannot be negative" });
      }

      const existingProductWithName = await Product.findOne({
        where: { name: name.trim() },
        transaction,
      });

      if (existingProductWithName) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ error: "Já existe um produto com este nome" });
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
          finalSlug = `${finalSlug}-${Date.now()}`;
        }
      } else {
        const existingSlug = await Product.findOne({
          where: { slug: finalSlug },
          transaction,
        });
        if (existingSlug) {
          await transaction.rollback();
          return res
            .status(400)
            .json({ error: "Já existe um produto com este slug" });
        }
      }

      const images = req.files;
      if (images && images.length > 10) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ error: "Máximo de 10 imagens permitidas por produto" });
      }

      if (parsedCategoryIds.length > 0) {
        const existingCategories = await Category.findAll({
          where: { id: parsedCategoryIds },
          transaction,
        });

        if (existingCategories.length !== parsedCategoryIds.length) {
          const foundIds = existingCategories.map((cat) => cat.id);
          const invalidIds = parsedCategoryIds.filter(
            (id) => !foundIds.includes(id)
          );
          await transaction.rollback();
          return res.status(400).json({
            error: `Categorias não encontradas: ${invalidIds.join(", ")}`,
          });
        }
      }

      const productData = {
        enabled: enabled !== undefined ? Boolean(enabled) : true,
        name: name.trim(),
        slug: finalSlug,
        stock: parsedStock,
        description: description || "",
        price: parsedPrice,
        price_with_discount: parsedPriceWithDiscount,
      };

      const product = await Product.create(productData, { transaction });

      if (parsedCategoryIds.length > 0) {
        const categories = await Category.findAll({
          where: { id: parsedCategoryIds },
          transaction,
        });
        await product.setCategories(categories, { transaction });
      }

      if (images && images.length > 0) {
        const imagensValidas = images.map((file) => ({
          path: `/uploads/${file.filename}`,
          enabled: true,
          product_id: product.id,
        }));
        await Image.bulkCreate(imagensValidas, { transaction });
      }

      if (Array.isArray(options) && options.length > 0) {
        const invalidOptions = options.filter(
          (opt) =>
            !opt.title ||
            !opt.type ||
            !opt.values ||
            (Array.isArray(opt.values) && opt.values.length === 0)
        );

        if (invalidOptions.length > 0) {
          await transaction.rollback();
          return res.status(400).json({
            error:
              "Opções inválidas. Cada opção deve ter title, type e values não vazios.",
          });
        }

        const opcoesValidas = options.map((opt) => {
          let valoresArray = [];

          if (Array.isArray(opt.values)) {
            valoresArray = opt.values;
          } else if (typeof opt.values === "string") {
            try {
              const parsed = JSON.parse(opt.values);
              valoresArray = Array.isArray(parsed) ? parsed : [opt.values];
            } catch {
              valoresArray = [opt.values];
            }
          }

          return {
            title: opt.title,
            shape: opt.shape || "square",
            radius: opt.radius || "4px",
            type: opt.type,
            values: valoresArray,
            product_id: product.id,
          };
        });

        await Option.bulkCreate(opcoesValidas, { transaction });
      }
      await transaction.commit();
      return res.status(201).json({
        message: "Produto cadastrado com sucesso!",
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
        },
      });
    } catch (error) {
      await transaction.rollback();

      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          error: "Dados inválidos",
          details: error.errors.map((err) => ({
            field: err.path,
            message: err.message,
          })),
        });
      }

      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({
          error: "Violação de restrição única",
          field: error.errors[0]?.path || "unknown",
        });
      }

      console.error("Erro no ProductController.store:", error);
      return res
        .status(500)
        .json({ error: "Erro interno do servidor", message: error.message });
    }
  },
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
          {
            name: {
              [Op.like]: `%${match.toLowerCase()}%`,
            },
          },
          {
            description: {
              [Op.like]: `%${match.toLowerCase()}%`,
            },
          },
        ];
      }

      if (priceRange) {
        const [min, max] = priceRange.split("-").map(Number);
        where.price = { [Op.between]: [min, max] };
      }

      const categoryFilterForWhere = category_ids
        ? {
            model: Category,
            as: "categories",
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
        as: "categories",
        attributes: ["id"],
        through: { attributes: [] },
        required: false,
      };

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

        const categoryIds = productJson.categories
          ? productJson.categories.map((category) => category.id)
          : [];

        delete productJson.categories;
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
      console.error("Erro no search:", error);
      return res.status(500).json({
        error: "Erro ao buscar produto",
        message: error.message,
      });
    }
  },
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
            association: "categories",
            attributes: ["id"],
            through: { attributes: [] },
          },
        ],
      });

      if (!product) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }

      const productJson = product.toJSON();

      const categoryIds = productJson.categories
        ? productJson.categories.map((cat) => cat.id)
        : [];

      delete productJson.categories;
      productJson.category_ids = categoryIds;

      return res.json({ product: productJson });
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      return res
        .status(500)
        .json({ error: error.message, message: "Erro ao buscar produto" });
    }
  },
  async update(req, res) {
    const { id } = req.params;
    const productId = Number(id);
    const transaction = await Product.sequelize.transaction();

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

      const existingProduct = await Product.findByPk(productId, {
        transaction,
      });
      if (!existingProduct) {
        await transaction.rollback();
        return res.status(404).json({ error: "Produto não encontrado" });
      }

      if (name && name.trim() !== existingProduct.name) {
        const existingProductWithName = await Product.findOne({
          where: {
            name: name.trim(),
            id: { [Op.ne]: productId },
          },
          transaction,
        });

        if (existingProductWithName) {
          await transaction.rollback();
          return res.status(400).json({
            error: "Já existe outro produto com este nome",
          });
        }
      }

      const updatedFields = {
        ...(enabled !== undefined && { enabled }),
        ...(name && { name: name.trim() }),
        ...(slug && { slug }),
        ...(stock !== undefined && { stock }),
        ...(description && { description }),
        ...(price !== undefined && { price }),
        ...(price_with_discount !== undefined && { price_with_discount }),
      };

      let options = [];
      if (rawOptions) {
        try {
          if (typeof rawOptions === "string") {
            options = JSON.parse(rawOptions);
          } else if (Array.isArray(rawOptions)) {
            options = rawOptions;
          } else {
            options = [rawOptions];
          }
        } catch (parseError) {
          await transaction.rollback();
          return res.status(400).json({
            error: "Formato inválido para as opções do produto",
          });
        }
      }

      if (
        category_ids &&
        Array.isArray(category_ids) &&
        category_ids.length > 0
      ) {
        const categories = await Category.findAll({
          where: { id: category_ids },
          transaction,
        });
        if (categories.length !== category_ids.length) {
          await transaction.rollback();
          const foundIds = categories.map((cat) => cat.id);
          const missingIds = category_ids.filter(
            (id) => !foundIds.includes(id)
          );
          return res.status(400).json({
            error: "Uma ou mais categorias não foram encontradas",
            details: {
              requested: category_ids,
              found: foundIds,
              missing: missingIds,
            },
          });
        }

        await existingProduct.setCategories(categories, { transaction });
      }

      await Product.update(updatedFields, {
        where: { id: productId },
        transaction,
      });

      const images = req.files;
      if (images && images.length > 0) {
        await Image.destroy({ where: { product_id: productId }, transaction });
        const novasImagens = images.map((file) => ({
          path: `/uploads/${file.filename}`,
          enabled: true,
          product_id: productId,
        }));
        await Image.bulkCreate(novasImagens, { transaction });
      }

      if (Array.isArray(options) && options.length > 0) {
        await Option.destroy({ where: { product_id: productId }, transaction });
        const novasOpcoes = options.map((opt) => {
          if (!opt.title || !opt.type) {
            throw new Error(`Opção inválida: title e type são obrigatórios`);
          }
          return {
            title: opt.title,
            shape: opt.shape || "square",
            radius: opt.radius || 0,
            type: opt.type,
            values: Array.isArray(opt.values)
              ? JSON.stringify(opt.values)
              : typeof opt.values === "string"
              ? opt.values
              : "[]",
            product_id: productId,
          };
        });

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
            attributes: ["id", "title", "shape", "radius", "type", "values"],
          },
          {
            model: Category,
            as: "categories",
            attributes: ["id", "name"],
            through: { attributes: [] },
          },
        ],
      });

      const productJson = updatedProduct.toJSON();

      if (productJson.options) {
        productJson.options = productJson.options.map((option) => ({
          ...option,
          values:
            typeof option.values === "string"
              ? JSON.parse(option.values)
              : option.values,
        }));
      }

      const categoryIds = productJson.categories?.map((cat) => cat.id) || [];
      delete productJson.categories;
      productJson.category_ids = categoryIds;

      return res.json({
        message: "Produto atualizado com sucesso",
        product: productJson,
      });
    } catch (err) {
      await transaction.rollback();
      console.error("Erro ao atualizar produto:", err);
      console.error("Stack trace:", err.stack);
      console.error("Request body:", req.body);

      return res.status(500).json({
        error: "Erro interno ao atualizar produto",
        ...(process.env.NODE_ENV === "development" && { details: err.message }),
      });
    }
  },
  async update(req, res) {
    const { id } = req.params;
    const productId = Number(id);
    const transaction = await Product.sequelize.transaction();

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

      const existingProduct = await Product.findByPk(productId, {
        transaction,
      });
      if (!existingProduct) {
        await transaction.rollback();
        return res.status(404).json({ error: "Produto não encontrado" });
      }

      if (name && name.trim() !== existingProduct.name) {
        const existingProductWithName = await Product.findOne({
          where: {
            name: name.trim(),
            id: { [Op.ne]: productId },
          },
          transaction,
        });

        if (existingProductWithName) {
          await transaction.rollback();
          return res.status(400).json({
            error: "Já existe outro produto com este nome",
          });
        }
      }

      const updatedFields = {
        ...(enabled !== undefined && { enabled }),
        ...(name && { name: name.trim() }),
        ...(slug && { slug }),
        ...(stock !== undefined && { stock }),
        ...(description && { description }),
        ...(price !== undefined && { price }),
        ...(price_with_discount !== undefined && { price_with_discount }),
      };

      let options = [];
      if (rawOptions) {
        try {
          if (typeof rawOptions === "string") {
            options = JSON.parse(rawOptions);
          } else if (Array.isArray(rawOptions)) {
            options = rawOptions;
          } else {
            options = [rawOptions];
          }
        } catch (parseError) {
          await transaction.rollback();
          return res.status(400).json({
            error: "Formato inválido para as opções do produto",
          });
        }
      }

      if (
        category_ids &&
        Array.isArray(category_ids) &&
        category_ids.length > 0
      ) {
        const categories = await Category.findAll({
          where: { id: category_ids },
          transaction,
        });
        if (categories.length !== category_ids.length) {
          await transaction.rollback();
          const foundIds = categories.map((cat) => cat.id);
          const missingIds = category_ids.filter(
            (id) => !foundIds.includes(id)
          );
          return res.status(400).json({
            error: "Uma ou mais categorias não foram encontradas",
            details: {
              requested: category_ids,
              found: foundIds,
              missing: missingIds,
            },
          });
        }

        await existingProduct.setCategories(categories, { transaction });
      }

      await Product.update(updatedFields, {
        where: { id: productId },
        transaction,
      });

      const images = req.files;
      if (images && images.length > 0) {
        await Image.destroy({ where: { product_id: productId }, transaction });
        const novasImagens = images.map((file) => ({
          path: `/uploads/${file.filename}`,
          enabled: true,
          product_id: productId,
        }));
        await Image.bulkCreate(novasImagens, { transaction });
      }

      // Atualiza opções - CORRIGIDO nome da coluna
      if (Array.isArray(options) && options.length > 0) {
        await Option.destroy({ where: { product_id: productId }, transaction });
        const novasOpcoes = options.map((opt) => {
          if (!opt.title || !opt.type) {
            throw new Error(`Opção inválida: title e type são obrigatórios`);
          }
          return {
            title: opt.title,
            shape: opt.shape || "square",
            radius: opt.radius || 0,
            type: opt.type,
            values: Array.isArray(opt.values)
              ? JSON.stringify(opt.values)
              : typeof opt.values === "string"
              ? opt.values
              : "[]",
            product_id: productId,
          };
        });

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
            attributes: ["id", "title", "shape", "radius", "type", "values"],
          },
          {
            model: Category,
            as: "categories",
            attributes: ["id", "name"],
            through: { attributes: [] },
          },
        ],
      });

      const productJson = updatedProduct.toJSON();

      if (productJson.options) {
        productJson.options = productJson.options.map((option) => ({
          ...option,
          values:
            typeof option.values === "string"
              ? JSON.parse(option.values)
              : option.values,
        }));
      }

      const categoryIds = productJson.categories?.map((cat) => cat.id) || [];
      delete productJson.categories;
      productJson.category_ids = categoryIds;

      return res.json({
        message: "Produto atualizado com sucesso",
        product: productJson,
      });
    } catch (err) {
      await transaction.rollback();
      console.error("Erro ao atualizar produto:", err);
      console.error("Stack trace:", err.stack);
      console.error("Request body:", req.body);

      return res.status(500).json({
        error: "Erro interno ao atualizar produto",
        ...(process.env.NODE_ENV === "development" && { details: err.message }),
      });
    }
  },

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
