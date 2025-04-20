const express = require("express");
const router = express.Router();
const termController = require("../controllers/termController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

// Define routes
router.post("/", isAdmin, protect, termController.createTerm);
router.post("/bulk", isAdmin, protect, termController.bulkCreateTerms);
router.get("/", termController.getAllTerms);
router.get("/:id", termController.getTermById);
router.put("/:id", isAdmin, protect, termController.updateTerm);
router.delete("/:id", isAdmin, protect, termController.deleteTerm);

module.exports = router;
