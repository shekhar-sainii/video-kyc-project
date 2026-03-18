const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = require("../config/env");

const ensureConfigured = () => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    const error = new Error("Cloudinary is not configured");
    error.statusCode = 500;
    throw error;
    
  }
};

const uploadImage = async (filePath, folder = "video-kyc/profile-images") => {
  ensureConfigured();

  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
  const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

  const fileBuffer = await fs.readFile(filePath);
  const file = new File([fileBuffer], path.basename(filePath));
  const formData = new FormData();

  formData.append("file", file);
  formData.append("api_key", CLOUDINARY_API_KEY);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const result = await response.json();

  if (!response.ok) {
    const error = new Error(result?.error?.message || "Cloudinary upload failed");
    error.statusCode = response.status || 500;
    throw error;
  }

  return result.secure_url;
};

module.exports = {
  uploadImage,
};
