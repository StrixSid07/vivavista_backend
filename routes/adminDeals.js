const express = require("express");
const router = express.Router();
const {
  generateDealsTemplate,
  downloadAllDeals,
  updateDealsFromExcel,
  generateDealPricesTemplate,
  bulkUploadDeals,
  bulkUpdateDealsByExcel,
  readAndInsertExcel,
} = require("../controllers/dealTemplateController");

const multer = require("multer");

// Setup multer to accept file uploads (in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route to generate Excel template
router.get("/template", generateDealsTemplate);
// Route to download all existing deals into template
router.get("/download-all", downloadAllDeals);
// Route to upload deals in bulk
router.post("/bulk-upload", upload.single("file"), bulkUploadDeals);
// Route to update existing deals or create new ones (upsert)
router.post("/bulk-update", upload.single("file"), updateDealsFromExcel);

// Route to generate Excel template
router.get("/price-template", generateDealPricesTemplate);
// Route to upload deals in bulk
router.post("/bulk-upload-price", upload.single("file"), readAndInsertExcel);
router.post("/bulk-upload-update", upload.single("file"), bulkUpdateDealsByExcel);

module.exports = router;