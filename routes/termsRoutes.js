const express = require("express");
const router = express.Router();
const termController = require("../controllers/termController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

// Define routes
router.post("/", protect, isAdmin, termController.createTerm);
router.post("/bulk", protect, isAdmin, termController.bulkCreateTerms);
router.get("/", termController.getAllTerms);
router.get("/:id", termController.getTermById);
router.put("/:id", protect, isAdmin, termController.updateTerm);
router.delete("/:id", protect, isAdmin, termController.deleteTerm);

module.exports = router;
