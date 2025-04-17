const express = require("express");
const {
  getHotDeals,
  getTopDeals,
  getTopDealsByDestination,
} = require("../controllers/trandingController");
const router = express.Router();
const { protect, isAdmin } = require("../middleware/authMiddleware");

router.get("/hotdeals", getHotDeals);
router.get("/topdeals", getTopDeals);
router.get(
  "/topdealsbydestinations/:destinationId/:dealId?",
  getTopDealsByDestination
);

module.exports = router;
