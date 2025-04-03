const express = require("express");
const {
  addAirport,
  deleteAirport,
  getAllAirports,
} = require("../controllers/airportController");
const router = express.Router();
const { protect, isAdmin } = require("../middleware/authMiddleware");

router.post("/admin/create-airport", addAirport); // Only admins can create other airport

router.get("/", getAllAirports);
router.delete("/admin/:code", protect, isAdmin, deleteAirport);

module.exports = router;
