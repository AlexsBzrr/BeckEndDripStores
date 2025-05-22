const Joi = require("joi");

const userSchema = Joi.object({
  firstname: Joi.string().min(2).max(50).required(),
  surname: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  confirmPassword: Joi.any().valid(Joi.ref("password")).required().messages({
    "any.only": "As senhas não coincidem",
  }),
});
module.exports = userSchema;
