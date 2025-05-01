const express = require("express");
const {
  addAirport,
  updateAirport,
  deleteAirport,
  getAllAirports,
} = require("../controllers/airportController");
const router = express.Router();
const { protect, isAdmin } = require("../middleware/authMiddleware");

router.post("/admin/create-airport", protect, isAdmin, addAirport);
router.put("/admin/update-airport/:id", protect, isAdmin, updateAirport);
router.get("/", getAllAirports);
router.delete("/admin/:id", protect, isAdmin, deleteAirport);

module.exports = router;
