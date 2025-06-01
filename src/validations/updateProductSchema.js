const Joi = require("joi");
const { Op } = require("sequelize");

const updateProductSchema = Joi.object({
  enabled: Joi.boolean().optional(),
  name: Joi.string().optional(),
  slug: Joi.string().optional(),
  stock: Joi.number().integer().optional(),
  description: Joi.string().optional(),
  price: Joi.number().optional(),
  price_with_discount: Joi.number().optional(),
  category_ids: Joi.array().items(Joi.number().integer()).optional(),
  images: Joi.array().items(Joi.string()).optional(),
  options: Joi.alternatives()
    .try(
      Joi.string(),
      Joi.array().items(
        Joi.object({
          title: Joi.string().required(),
          shape: Joi.string().valid("square", "circle").optional(),
          radius: Joi.number().optional(),
          type: Joi.string().required(),
          values: Joi.any().required(),
        }).unknown(true)
      )
    )
    .optional(),
});

module.exports = updateProductSchema;
