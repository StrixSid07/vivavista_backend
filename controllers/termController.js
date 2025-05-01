const Term = require("../models/Terms"); // Adjust the path as necessary

// Create a new term
exports.createTerm = async (req, res) => {
  try {
    const { title, content } = req.body;
    const sequenceNumber = Number(req.body.sequenceNumber); // Convert to number

    if (!title || !content || isNaN(sequenceNumber)) {
      return res.status(400).json({ message: "Invalid or missing fields" });
    }

    const existingTerm = await Term.findOne({ sequenceNumber });
    if (existingTerm) {
      return res
        .status(400)
        .json({ message: "Sequence number already exists" });
    }

    const newTerm = new Term({ title, content, sequenceNumber });
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

    // Validate each entry
    for (const term of req.body) {
      if (
        !term.title ||
        !term.content ||
        typeof term.sequenceNumber !== "number"
      ) {
        return res
          .status(400)
          .json({ message: "Invalid term format in array" });
      }
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
    const terms = await Term.find().sort({ sequenceNumber: 1 });
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
    const { title, content, sequenceNumber } = req.body;

    const existingTerm = await Term.findOne({
      sequenceNumber,
      _id: { $ne: req.params.id },
    });
    if (existingTerm) {
      return res
        .status(400)
        .json({ message: "Sequence number already exists" });
    }

    const updatedTerm = await Term.findByIdAndUpdate(
      req.params.id,
      { title, content, sequenceNumber },
      { new: true, runValidators: true }
    );

    if (!updatedTerm) {
      return res.status(404).json({ message: "Term not found" });
    }

    res
      .status(200)
      .json({ message: "Term updated successfully", term: updatedTerm });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating the term", error: error.message });
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
