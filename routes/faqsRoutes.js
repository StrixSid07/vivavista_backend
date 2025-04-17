const express = require("express");
const router = express.Router();
const faqsController = require("../controllers/faqsController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

router.post("/", protect, isAdmin, faqsController.createFaq);
router.get("/", faqsController.getAllFaqs);
router.post("/bulk", faqsController.createMultipleFaqs);
router.get("/:id", faqsController.getFaqById);
router.put("/:id", protect, isAdmin, faqsController.updateFaq);
router.delete("/:id", faqsController.deleteFaq);

module.exports = router;
