const express = require("express");
const router = express.Router();
const carouselController = require("../controllers/carouselController");
const { upload } = require("../middleware/imageUpload");


router.post("/", upload.array("images", 5), carouselController.createCarousel);
router.get("/", carouselController.getAllCarousels);
router.put(
  "/:id",
  upload.array("images", 5),
  carouselController.updateCarousel
);
router.delete("/:id", carouselController.deleteCarousel);

module.exports = router;
