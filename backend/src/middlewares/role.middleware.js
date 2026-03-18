const ApiResponse = require("../core/apiResponse");

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, "Unauthorized", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.error(res, "Forbidden - Access denied", 403);
    }

    next();
  };
};

module.exports = roleMiddleware;