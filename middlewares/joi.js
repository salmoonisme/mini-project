const Joi = require("joi");

const loginValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(5).required(),
});

const menuValidator = Joi.object({
  name: Joi.string()
    .min(5)
    .pattern(/^[a-zA-Z]+(\s[a-zA-Z]+)*$/)
    .required(),
  quantity: Joi.number()
    .integer()
    .custom((value, helpers) => {
      if (value % 1 !== 0) {
        return helpers.message("Price must be a round number");
      }
      return value;
    })
    .required(),
  price: Joi.number()
    .integer()
    .custom((value, helpers) => {
      if (value % 1 !== 0) {
        return helpers.message("Price must be a round number");
      }
      return value;
    })
    .required(),
});

const registerValidator = Joi.object({
  username: Joi.string()
    .min(5)
    .pattern(/^[a-zA-Z0-9_.]+$/)
    .required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(5).required(),
  role: Joi.string()
    .custom((value, helpers) => {
      if (value !== "user" && value !== "admin") {
        return helpers.message('"myField" must be either "user" or "admin"');
      }
      return value;
    })
    .required(),
});

module.exports = {
  loginValidator,
  menuValidator,
  registerValidator,
};
