const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");
const ApiResponse = require("../core/apiResponse");

const User = require("../modules/user/user.model");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ApiResponse.error(res, "No token provided", 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return ApiResponse.error(res, "Unauthorized", 401);
    }

    req.user = {
      id: user._id,
      role: user.role,
    };

    next();
  } catch (error) {
    return ApiResponse.error(res, "Invalid or expired token", 401);
  }
};

module.exports = authMiddleware;