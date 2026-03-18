const Joi = require("joi");

exports.updateProfileSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    phone: Joi.string().allow("").max(20).optional(),
    address: Joi.string().allow("").max(250).optional(),
});

exports.changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
});
