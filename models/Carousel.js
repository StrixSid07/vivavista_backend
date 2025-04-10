const mongoose = require("mongoose");

const CarouselSchema = new mongoose.Schema(
  {
    images: [{ type: String, required: true }], // Array of image URLs (max 5)
  },
  { timestamps: true }
);

module.exports = mongoose.model("Carousel", CarouselSchema);
