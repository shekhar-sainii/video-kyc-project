const mongoose = require("mongoose");

const verificationTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    token: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["emailVerification", "passwordReset"],
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // auto delete
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VerificationToken", verificationTokenSchema);