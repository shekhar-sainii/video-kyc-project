const express = require("express");
const router = express.Router();

const upload = require("../../config/multer");
const validate = require("../../middlewares/validate.middleware");

const kycController = require("./kyc.controller");

const {
  submitKycSchema,
  verifyKycSchema,
} = require("./kyc.validation");

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