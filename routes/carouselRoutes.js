const express = require("express");
const router = express.Router();
const carouselController = require("../controllers/carouselController");
const { upload } = require("../middleware/imageUpload");
const { protect, isAdmin } = require("../middleware/authMiddleware");

router.post(
  "/",
  upload.array("images", 5),
  protect,
  isAdmin,
  carouselController.createCarousel
);
router.get("/", carouselController.getAllCarousels);
router.put(
  "/:id",
  upload.array("images", 5),
  protect,
  isAdmin,
  carouselController.updateCarousel
);
router.delete("/:id", protect, isAdmin, carouselController.deleteCarousel);

module.exports = router;
