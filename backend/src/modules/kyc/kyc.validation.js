const Joi = require("joi");

exports.submitKycSchema = Joi.object({
  panNumber: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid PAN format",
    }),

  signature: Joi.string()
    .required()
    .messages({
      "string.empty": "Signature is required",
    }),
});

exports.verifyKycSchema = Joi.object({
  applicationId: Joi.string()
    .required()
    .messages({
      "string.empty": "Application ID is required",
    }),
});