// const multer = require("multer");
// const multerS3 = require("multer-s3");
// const aws = require("aws-sdk");
// const path = require("path");
// const fs = require("fs-extra");
// require("dotenv").config();

// const IMAGE_STORAGE = process.env.IMAGE_STORAGE || "local";

// // ✅ AWS S3 Configuration
// const s3 = new aws.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
// });

// // ✅ Local Storage Configuration
// const localStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = process.env.LOCAL_IMAGE_PATH || "uploads/";
//     fs.ensureDirSync(uploadPath); // Ensure directory exists
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// // ✅ S3 Storage Configuration
// const s3Storage = multerS3({
//   s3: s3,
//   bucket: process.env.AWS_S3_BUCKET,
//   acl: "public-read", // Make file publicly accessible
//   contentType: multerS3.AUTO_CONTENT_TYPE,
//   key: (req, file, cb) => {
//     cb(null, `uploads/${Date.now()}-${file.originalname}`);
//   },
// });

// // ✅ Choose Storage Method Based on ENV
// const upload = multer({
//   storage: IMAGE_STORAGE === "s3" ? s3Storage : localStorage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
//     if (!allowedTypes.includes(file.mimetype)) {
//       return cb(new Error("Only JPEG, PNG, and JPG formats are allowed"), false);
//     }
//     cb(null, true);
//   },
// });

// module.exports = upload;

const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
require("dotenv").config();

// ✅ Local Storage Configuration
const uploadPath = process.env.LOCAL_IMAGE_PATH || "uploads/";
fs.ensureDirSync(uploadPath); // Ensure directory exists

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// ✅ Multer Upload Configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only JPEG, PNG, and JPG formats are allowed"),
        false
      );
    }
    cb(null, true);
  },
});

module.exports = upload;
