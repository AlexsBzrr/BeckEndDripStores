// // middlewares/upload.js
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // Garante que a pasta "uploads" exista
// const uploadPath = path.resolve(__dirname, "..", "..", "uploads");
// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath);
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadPath); // salva na pasta /uploads
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = `${Date.now()}-${Math.round(
//       Math.random() * 1e9
//     )}${path.extname(file.originalname)}`;
//     cb(null, uniqueName);
//   },
// });

// const upload = multer({
//   storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // limite de 5MB
//   },
//   fileFilter: (req, file, cb) => {
//     const allowedMimes = [
//       "image/jpeg",
//       "image/pjpeg",
//       "image/png",
//       "image/gif",
//       "image/webp",
//     ];
//     if (allowedMimes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error("Tipo de arquivo inválido."), false);
//     }
//   },
// });

// module.exports = upload;
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

const upload = multer({ storage });

module.exports = upload;
