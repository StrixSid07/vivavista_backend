const express = require("express");
const {
  getHotDeals,
  getTopDeals,
  getTopdealByDestination,
} = require("../controllers/trandingController");
const router = express.Router();
const { protect, isAdmin } = require("../middleware/authMiddleware");

router.get("/hotdeals", getHotDeals);
router.get("/topdeals", getTopDeals);
router.get("/topdealsbydestinations/:destinationId/:dealId?", getTopDeals);

module.exports = router;
