const express = require("express");
const router = express.Router();

const {
  getBoardBasis,
  getBoardBasisDropdown,
  addBoardBasis,
  updateBoardBasis,
  deleteBoardBasis,
} = require("../controllers/boardbasisController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

// Get all holidays
router.get("/boardbasis", getBoardBasis);

// Get dropdown-friendly list (only _id & name)
router.get("/dropdown-boardbasis", getBoardBasisDropdown);

// Create a new holiday
router.post("/", protect, isAdmin, addBoardBasis);

// Update a holiday by ID
router.put("/:id", protect, isAdmin, updateBoardBasis);

// Delete a holiday by ID
router.delete("/:id", protect, isAdmin, deleteBoardBasis);

module.exports = router;
