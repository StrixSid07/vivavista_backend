const Holiday = require("../models/Holiday");

// Get all holidays (no deals to populate since not in schema)
exports.getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ name: 1 });
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get holiday dropdown (returns _id and name only)
exports.getHolidayDropdown = async (req, res) => {
  try {
    const holidays = await Holiday.find({}, "_id name").sort({ name: 1 });
    res.json(holidays);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Add a new holiday
exports.addHoliday = async (req, res) => {
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const holiday = new Holiday({ name });
    await holiday.save();

    res.status(201).json({ message: "Holiday created successfully", holiday });
  } catch (error) {
    console.error("Add Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update an existing holiday
exports.updateHoliday = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const holiday = await Holiday.findById(id);

    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    if (name) holiday.name = name;

    await holiday.save();
    res.json({ message: "Holiday updated successfully", holiday });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a holiday
exports.deleteHoliday = async (req, res) => {
  const { id } = req.params;

  try {
    const holiday = await Holiday.findByIdAndDelete(id);

    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    res.json({ message: "Holiday deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
