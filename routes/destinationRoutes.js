const express = require("express");
const router = express.Router();
const {
  getDestinations,
  addDestination,
  getDestinationDropdown,
  updateDestination,
  deleteDestination,
  deleteDestinationImage,
  getFilterDealsByDestination,
} = require("../controllers/destinationController");
const { upload, uploadToS3 } = require("../middleware/imageUpload");
const { protect, isAdmin } = require("../middleware/authMiddleware");
router.get("/destinations", getDestinations);
router.get("/dropdown-destionation", getDestinationDropdown);
router.post("/", protect, isAdmin, upload.single("images"), addDestination);
router.put(
  "/:id",
  protect,
  isAdmin,
  upload.single("images"),
  updateDestination
); // 🔄 Update
router.delete("/:id", protect, isAdmin, deleteDestination); // 🗑️ Delete
router.delete(
  "/image/:destinationId",
  protect,
  isAdmin,
  deleteDestinationImage
);
router.get("/destination-filter", getFilterDealsByDestination);
module.exports = router;
