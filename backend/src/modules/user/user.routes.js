const express = require("express");
const userController = require("./user.controller");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");
const upload = require("../../config/multer");
const {
    updateProfileSchema,
    changePasswordSchema,
} = require("./user.validation");

const router = express.Router();

// All routes protected
router.use(authMiddleware);

// User routes
router.get("/me", userController.getProfile);

router.patch(
    "/update-profile",
    upload.single("profileImage"),
    validate(updateProfileSchema),
    userController.updateProfile
);

router.patch(
    "/change-password",
    validate(changePasswordSchema),
    userController.changePassword
);

router.delete("/delete-account", userController.deleteAccount);

// ================= ADMIN ROUTES =================

// Get all users
router.get(
    "/admin/all-users",
    roleMiddleware("admin"),
    userController.getAllUsers
);

router.get(
    "/admin/security-logs",
    roleMiddleware("admin"),
    userController.getSecurityLogs
);

// Deactivate user
router.patch(
    "/admin/deactivate/:id",
    roleMiddleware("admin"),
    userController.deactivateUser
);

// Activate user
router.patch(
    "/admin/activate/:id",
    roleMiddleware("admin"),
    userController.activateUser
);

module.exports = router;
