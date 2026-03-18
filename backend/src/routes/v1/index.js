const express = require("express");

const authRoutes = require("../../modules/auth/auth.routes");
const userRoutes = require("../../modules/user/user.routes");
const kycRoutes = require("../../modules/kyc/kyc.routes");
// const orderRoutes = require("../../modules/user/user.routes");


const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/kyc", kycRoutes);

module.exports = router;