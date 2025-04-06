const Faq = require("../models/Faqs");

exports.createFaq = async (req, res) => {
  try {
    const faq = new Faq(req.body);
    await faq.save();
    res.status(201).json(faq);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createMultipleFaqs = async (req, res) => {
  try {
    const faqs = req.body;

    if (!Array.isArray(faqs) || faqs.length === 0) {
      return res.status(400).json({ error: "Input must be a non-empty array" });
    }

    const savedFaqs = await Faq.insertMany(faqs);
    res.status(201).json(savedFaqs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ createdAt: -1 });
    res.status(200).json(faqs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFaqById = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) return res.status(404).json({ error: "FAQ not found" });
    res.status(200).json(faq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateFaq = async (req, res) => {
  try {
    const updatedFaq = await Faq.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedFaq) return res.status(404).json({ error: "FAQ not found" });
    res.status(200).json(updatedFaq);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteFaq = async (req, res) => {
  try {
    const deleted = await Faq.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "FAQ not found" });
    res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
