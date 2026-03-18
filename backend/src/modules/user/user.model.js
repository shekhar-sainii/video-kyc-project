const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema(
    {
        provider: {
            type: String,
            enum: ["google", "github", "apple"],
            required: true,
        },
        providerId: {
            type: String,
            required: true,
        },
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },

        phone: {
            type: String,
            default: "",
            trim: true,
        },

        address: {
            type: String,
            default: "",
            trim: true,
        },

        profileImage: {
            type: String,
            default: "",
        },

        password: {
            type: String,
            required: false, // null for OAuth-only users
        },

        providers: [providerSchema], // Multi OAuth linking

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
        
        lastLoginAt: {
            type: Date,
        },
        failedLoginAttempts: {
            type: Number,
            default: 0,
        },

        lockUntil: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
