const ApiResponse = require("../core/apiResponse");

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);

  if (error) {
    return ApiResponse.error(res, error.details[0].message, 400);
  }

  next();
};

module.exports = validate;