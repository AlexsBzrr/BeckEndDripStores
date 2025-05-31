const joi = require("joi");

// Schema de validação Joi
const categorySchema = joi.object({
  name: joi.string().trim().min(1).max(255).required(),
  slug: joi.string().trim().min(1).max(255).required(),
  use_in_menu: joi.boolean().required(),
});

module.exports = categorySchema;
