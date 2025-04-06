const express = require("express");
const router = express.Router();
const faqsController = require("../controllers/faqsController");

router.post("/", faqsController.createFaq);
router.get("/", faqsController.getAllFaqs);
router.post("/bulk", faqsController.createMultipleFaqs);
router.get("/:id", faqsController.getFaqById);
router.put("/:id", faqsController.updateFaq);
router.delete("/:id", faqsController.deleteFaq);

module.exports = router;
