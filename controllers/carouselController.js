const Carousel = require("../models/Carousel");

// POST: Upload new carousel
exports.createCarousel = async (req, res) => {
  try {
    const images = req.files.map((file) => `/uploads/${file.filename}`);
    if (images.length > 5) {
      return res.status(400).json({ message: "Max 5 images allowed." });
    }

    const carousel = new Carousel({
      images,
    });

    const saved = await carousel.save();
    res.status(201).json(saved);
  } catch (err) {
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

    const newImages = req.files.map((file) => `/uploads/${file.filename}`);
    if (newImages.length > 5)
      return res.status(400).json({ message: "Max 5 images allowed." });

    carousel.images = newImages;

    const updated = await carousel.save();
    res.status(200).json(updated);
  } catch (err) {
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
