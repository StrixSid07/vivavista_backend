const express = require("express");
const router = express.Router();

const {
  getHolidays,
  getHolidayDropdown,
  addHoliday,
  updateHoliday,
  deleteHoliday,
} = require("../controllers/holidayController");

// Get all holidays
router.get("/holidays", getHolidays);

// Get dropdown-friendly list (only _id & name)
router.get("/dropdown-holiday", getHolidayDropdown);

// Create a new holiday
router.post("/", addHoliday);

// Update a holiday by ID
router.put("/:id", updateHoliday);

// Delete a holiday by ID
router.delete("/:id", deleteHoliday);

module.exports = router;
