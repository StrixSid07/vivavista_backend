const mongoose = require("mongoose");

const HolidaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Holiday", HolidaySchema);
