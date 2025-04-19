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

// const multer = require("multer");
// const path = require("path");
// const fs = require("fs-extra");
// require("dotenv").config();

// // ✅ Local Storage Configuration
// const uploadPath = process.env.LOCAL_IMAGE_PATH || "uploads/";
// fs.ensureDirSync(uploadPath); // Ensure directory exists

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// // ✅ Multer Upload Configuration
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
//     if (!allowedTypes.includes(file.mimetype)) {
//       return cb(
//         new Error("Only JPEG, PNG, and JPG formats are allowed"),
//         false
//       );
//     }
//     cb(null, true);
//   },
// });

// module.exports = upload;

const multer = require("multer");
const { S3Client ,DeleteObjectCommand} = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const fs = require("fs-extra");
require("dotenv").config();

const IMAGE_STORAGE = process.env.IMAGE_STORAGE || "local";

// ✅ Multer memory storage (for S3)
const memoryStorage = multer.memoryStorage();

// ✅ Local disk storage
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.LOCAL_IMAGE_PATH || "uploads/";
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: IMAGE_STORAGE === "s3" ? memoryStorage : localStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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

// ✅ S3 upload handler (to be used in controller)
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadToS3 = async (file) => {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `uploads/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: "public-read",
    },
  });

  const result = await upload.done();
  return result.Location; // public URL
};
const deleteFromS3 = async (imageUrl) => {
  try {
    const bucketName = process.env.AWS_S3_BUCKET;

    // Extract the key from the image URL
    const url = new URL(imageUrl);
    const key = decodeURIComponent(url.pathname.slice(1)); // remove leading "/"

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
    console.log("✅ Image deleted from S3:", key);
    return true;
  } catch (error) {
    console.error("❌ Failed to delete image from S3:", error);
    throw error;
  }
};

module.exports = {
  upload,
  uploadToS3,
  deleteFromS3
};
