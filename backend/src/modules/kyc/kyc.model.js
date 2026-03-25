const mongoose = require("mongoose");
const MAX_KYC_VERIFICATION_ATTEMPTS = 5;

const kycSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    panNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    },

    signature: {
      type: String,
      required: true,
    },

    uploadedPhoto: {
      type: String,
      required: true,
    },

    panCardImage: {
      type: String,
      default: null,
    },

    selfieImage: {
      type: String,
      default: null,
    },

    faceMatch: {
      type: Boolean,
      default: null,
    },

    faceMatchScore: {
      type: Number,
      default: null,
    },

    panMatch: {
      type: Boolean,
      default: null,
    },

    status: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },

    verificationMessage: {
      type: String,
      default: null,
    },

    verificationAttempts: {
      type: Number,
      default: 0,
      min: 0,
      max: MAX_KYC_VERIFICATION_ATTEMPTS,
    },

    maxVerificationAttempts: {
      type: Number,
      default: MAX_KYC_VERIFICATION_ATTEMPTS,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("KYCApplication", kycSchema);
