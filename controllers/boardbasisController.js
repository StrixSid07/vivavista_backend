const BoardBasis = require("../models/BoardBasis");

// Get all boardbasiss (no deals to populate since not in schema)
exports.getBoardBasis = async (req, res) => {
  try {
    const boardbasis = await BoardBasis.find().sort({ name: 1 });
    res.json(boardbasis);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get boardbasis dropdown (returns _id and name only)
exports.getBoardBasisDropdown = async (req, res) => {
  try {
    const boardbasis = await BoardBasis.find({}, "_id name").sort({ name: 1 });
    res.json(boardbasis);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Add a new boardbasis
exports.addBoardBasis = async (req, res) => {
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const boardbasis = new BoardBasis({ name });
    await boardbasis.save();

    res
      .status(201)
      .json({ message: "BoardBasis created successfully", boardbasis });
  } catch (error) {
    console.error("Add Error:", error);

    // Check for duplicate key error
    if (error.code === 11000 && error.keyPattern?.name) {
      return res.status(400).json({
        message: `BoardBasis with name '${error.keyValue.name}' already exists.`,
      });
    }

    res.status(500).json({ error: "Server error" });
  }
};

// Update an existing boardbasis
exports.updateBoardBasis = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const boardbasis = await BoardBasis.findById(id);

    if (!boardbasis) {
      return res.status(404).json({ message: "BoardBasis not found" });
    }

    if (name) boardbasis.name = name;

    await boardbasis.save();
    res.json({ message: "BoardBasis updated successfully", boardbasis });
  } catch (error) {
    console.error("Update Error:", error);

    if (error.code === 11000 && error.keyPattern?.name) {
      return res
        .status(400)
        .json({
          message: `BoardBasis with name '${error.keyValue.name}' already exists.`,
        });
    }
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a boardbasis
exports.deleteBoardBasis = async (req, res) => {
  const { id } = req.params;

  try {
    const boardbasis = await BoardBasis.findByIdAndDelete(id);

    if (!boardbasis) {
      return res.status(404).json({ message: "BoardBasis not found" });
    }

    res.json({ message: "BoardBasis deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
