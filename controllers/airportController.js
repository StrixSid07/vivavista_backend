const Airport = require("../models/Airport");

// // Get all airports
// exports.getAllAirports = async (req, res) => {
//   try {
//     const airports = await Airport.find();
//     res.json(airports);
//   } catch (err) {
//     res.status(500).json({ message: "Server Error" });
//   }
// };

exports.getAllAirports = async (req, res) => {
  try {
    const airports = await Airport.find(
      {},
      "_id name code location category"
    ).sort({ name: 1 });
    res.json(airports);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.addAirport = async (req, res) => {
  try {
    const { name, code, location, category } = req.body;
    const newAirport = new Airport({ name, code, location, category });
    await newAirport.save();
    res.status(201).json(newAirport);
  } catch (err) {
    res.status(400).json({ message: "Invalid Data" });
  }
};

exports.deleteAirport = async (req, res) => {
  try {
    const Code = req.params.code.toUpperCase();
    const airport = await Airport.findOneAndDelete({ code: Code });
    if (!airport) return res.status(404).json({ message: "Airport Not Found" });
    res.json({ message: "Airport Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};
