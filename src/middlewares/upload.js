const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, "..", "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${crypto.randomBytes(8).toString("hex")}${ext}`;
    cb(null, filename);
  },
});

// ✅ SOLUÇÃO: Use .fields() para aceitar múltiplos campos
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Apenas arquivos de imagem são permitidos"));
    }

    return cb(null, true);
  },
}).array("files", 5);
module.exports = upload;
