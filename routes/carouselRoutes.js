const express = require("express");
const router = express.Router();
const carouselController = require("../controllers/carouselController");
const { upload } = require("../middleware/imageUpload");
const { protect, isAdmin } = require("../middleware/authMiddleware");

router.post(
  "/",
  upload.array("images", 5),
  isAdmin,
  protect,
  carouselController.createCarousel
);
router.get("/", carouselController.getAllCarousels);
router.put(
  "/:id",
  upload.array("images", 5),
  isAdmin,
  protect,
  carouselController.updateCarousel
);
router.delete("/:id", isAdmin, protect, carouselController.deleteCarousel);

module.exports = router;
