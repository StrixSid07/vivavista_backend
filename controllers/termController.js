const Term = require("../models/Terms"); // Adjust the path as necessary

// Create a new term
exports.createTerm = async (req, res) => {
  try {
    const { mainTitle, data } = req.body;

    // Basic structure validation
    if (!mainTitle || !Array.isArray(data)) {
      return res.status(400).json({ message: "Invalid data structure" });
    }

    const newTerm = new Term(req.body);
    await newTerm.save();
    res
      .status(201)
      .json({ message: "Term created successfully", term: newTerm });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating term", error: error.message });
  }
};

// Bulk create terms
exports.bulkCreateTerms = async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ message: "Invalid data structure" });
    }

    const terms = await Term.insertMany(req.body);
    res.status(201).json({ message: "Terms created successfully", terms });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating terms", error: error.message });
  }
};

// Get all terms
exports.getAllTerms = async (req, res) => {
  try {
    const terms = await Term.find();
    res.status(200).json(terms);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching terms", error: error.message });
  }
};

// Get a term by ID
exports.getTermById = async (req, res) => {
  try {
    const term = await Term.findById(req.params.id);
    if (!term) {
      return res.status(404).json({ message: "Term not found" });
    }
    res.status(200).json(term);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching term", error: error.message });
  }
};

// Update a term by ID
exports.updateTerm = async (req, res) => {
  try {
    const term = await Term.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!term) {
      return res.status(404).json({ message: "Term not found" });
    }
    res.status(200).json({ message: "Term updated successfully", term });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating term", error: error.message });
  }
};

// Delete a term by ID
exports.deleteTerm = async (req, res) => {
  try {
    const term = await Term.findByIdAndDelete(req.params.id);
    if (!term) {
      return res.status(404).json({ message: "Term not found" });
    }
    res.status(200).json({ message: "Term deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting term", error: error.message });
  }
};
