const express = require("express");
const router = express.Router();

const {
  getHolidays,
  getHolidayDropdown,
  addHoliday,
  updateHoliday,
  deleteHoliday,
  getFilterDealsByHoliday,
} = require("../controllers/holidayController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

// Get all holidays
router.get("/holidays", getHolidays);

// Get dropdown-friendly list (only _id & name)
router.get("/dropdown-holiday", getHolidayDropdown);

// Create a new holiday
router.post("/", protect, isAdmin, addHoliday);

// Update a holiday by ID
router.put("/:id", protect, isAdmin, updateHoliday);

// Delete a holiday by ID
router.delete("/:id", protect, isAdmin, deleteHoliday);

router.get("/holiday-filter", getFilterDealsByHoliday);

module.exports = router;
