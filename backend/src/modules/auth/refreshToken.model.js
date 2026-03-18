const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    token: {
      type: String,
      required: true, // store hashed token
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // auto delete when expired (TTL index)
    },

    deviceInfo: {
      type: String, // optional (browser/device tracking)
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);