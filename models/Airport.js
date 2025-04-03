const mongoose = require("mongoose");

const AirportSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    category: {
      type: String, // ✅ Now part of an object
      enum: [
        "London",
        "Midlands",
        "North East",
        "North West",
        "Scotland",
        "Northern Ireland",
        "South",
        "West Country & Wales",
        "Yorkshire",
        "East Anglia",
        "Isle of Man",
      ],
      required: true,
    },
  },
  { timestamps: true } // ✅ Correct placement for schema options
);

module.exports = mongoose.model("Airport", AirportSchema);
