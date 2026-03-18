const express = require("express");
const router = express.Router();

const upload = require("../../config/multer");
const authMiddleware = require("../../middlewares/auth.middleware");
const roleMiddleware = require("../../middlewares/role.middleware");
const validate = require("../../middlewares/validate.middleware");

const kycController = require("./kyc.controller");

const {
  submitKycSchema,
  verifyKycSchema,
} = require("./kyc.validation");

router.use(authMiddleware);

router.get(
  "/admin/dashboard",
  roleMiddleware("admin"),
  kycController.getAdminDashboard
);

router.get(
  "/admin/queue",
  roleMiddleware("admin"),
  kycController.getAdminQueue
);

router.get(
  "/admin/application/:id",
  roleMiddleware("admin"),
  kycController.getAdminApplicationDetail
);

router.post(
  "/submit",
  upload.single("uploadedPhoto"),
  validate(submitKycSchema),
  kycController.submitKyc
);

router.get(
  "/applications",
  kycController.getApplications
);

router.post(
  "/verify",
  upload.fields([
    { name: "panCardImage", maxCount: 1 },
    { name: "selfieImage", maxCount: 1 },
  ]),
  validate(verifyKycSchema),
  kycController.verifyKyc
);

module.exports = router;
