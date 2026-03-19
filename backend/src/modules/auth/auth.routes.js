const express = require("express");
const passport = require("passport");
const authController = require("./auth.controller");
const validate = require("../../middlewares/validate.middleware");
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("./auth.validation");

const router = express.Router();

router.post("/register",
  validate(registerSchema),
  authController.register
);

router.post("/login",
  validate(loginSchema),
  authController.login
);

router.post("/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

router.post("/reset-password",
  validate(resetPasswordSchema),
  authController.resetPassword
);

router.post("/resend-verification", authController.resendVerification);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.get("/verify-email", authController.verifyEmail);

router.get("/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get("/google/callback", authController.googleCallback);

module.exports = router;