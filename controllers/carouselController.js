const Carousel = require("../models/Carousel");
const { uploadToS3 } = require("../middleware/imageUpload");
const IMAGE_STORAGE = process.env.IMAGE_STORAGE || "local";

// POST: Upload new carousel
exports.createCarousel = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required." });
    }

    if (req.files.length > 5) {
      return res.status(400).json({ message: "Max 5 images allowed." });
    }

    let imageUrls = [];

    if (IMAGE_STORAGE === "s3") {
      imageUrls = await Promise.all(req.files.map((file) => uploadToS3(file)));
    } else {
      imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const carousel = new Carousel({ images: imageUrls });
    const saved = await carousel.save();

    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating carousel:", err);
    res.status(500).json({ error: err.message });
  }
};

// GET: All carousels
exports.getAllCarousels = async (req, res) => {
  try {
    const all = await Carousel.find();
    res.status(200).json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT: Update carousel (images + text)
exports.updateCarousel = async (req, res) => {
  try {
    const { id } = req.params;
    const carousel = await Carousel.findById(id);
    if (!carousel)
      return res.status(404).json({ message: "Carousel not found" });

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required." });
    }

    if (req.files.length > 5) {
      return res.status(400).json({ message: "Max 5 images allowed." });
    }

    let imageUrls = [];

    if (IMAGE_STORAGE === "s3") {
      imageUrls = await Promise.all(req.files.map((file) => uploadToS3(file)));
    } else {
      imageUrls = req.files.map((file) => `/uploads/${file.filename}`);
    }

    carousel.images = imageUrls;

    const updated = await carousel.save();
    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating carousel:", err);
    res.status(500).json({ error: err.message });
  }
};

// DELETE: Remove one
exports.deleteCarousel = async (req, res) => {
  try {
    const { id } = req.params;
    await Carousel.findByIdAndDelete(id);
    res.status(200).json({ message: "Carousel deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
