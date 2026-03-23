const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Render/CI clones won't include `backend/src/uploads` because it's gitignored.
// Ensure the upload directory exists before Multer tries to write files.
const uploadDir = path.resolve(__dirname, "..", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

module.exports = upload;