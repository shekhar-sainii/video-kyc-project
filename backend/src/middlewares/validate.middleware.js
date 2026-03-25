const ApiResponse = require("../core/apiResponse");
const {StatusCodes} = require("http-status-codes")

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);

  if (error) {
    return ApiResponse.error(res, error.details[0].message, StatusCodes.BAD_REQUEST);
  }

  next();
};

module.exports = validate;