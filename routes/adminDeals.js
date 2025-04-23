const express = require("express");
const router = express.Router();
const {
  generateDealsTemplate,
} = require("../controllers/dealTemplateController");

// Route to generate Excel template
router.get("/template", generateDealsTemplate);

module.exports = router;
