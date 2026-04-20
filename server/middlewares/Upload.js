// middleware/upload.js

const multer = require("multer");
const path = require("path");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, "../public/uploads"));
//   },

//   filename: function (req, file, cb) {
//     const uniqueName =
//       Date.now() + "-" + file.fieldname + path.extname(file.originalname);
//     cb(null, uniqueName);
//   },
// });

// const fileFilter = (req, file, cb) => {

//   const allowedTypes = [
//     "image/jpeg",
//     "image/png",
//     "image/webp",
//     "application/pdf",
//     "video/mp4"
//   ];

//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Invalid file type"), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
// });

const upload = multer({
  storage: multer.memoryStorage(), // ✅ NO DISK
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "video/mp4",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
  limits: { fileSize: 40 * 1024 * 1024 },
});

module.exports = upload;
