const Joi = require("joi");

exports.updateProfileSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
});

exports.changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
});