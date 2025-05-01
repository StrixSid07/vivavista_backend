const Airport = require("../models/Airport");

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

    // Check if an airport with same name or code already exists
    const existingAirport = await Airport.findOne({
      $or: [{ name: name }, { code: code.toUpperCase() }],
    });

    if (existingAirport) {
      return res
        .status(400)
        .json({ message: "Airport with same name or code already exists" });
    }

    const newAirport = new Airport({
      name,
      code: code.toUpperCase(), // Save code consistently in uppercase
      location,
      category,
    });

    await newAirport.save();
    res.status(201).json(newAirport);
  } catch (err) {
    res.status(400).json({ message: "Invalid Data" });
  }
};

exports.updateAirport = async (req, res) => {
  try {
    const { name, code, location, category } = req.body;
    const { id } = req.params;

    // Check if another airport already has the same name or code
    const duplicate = await Airport.findOne({
      _id: { $ne: id }, // Exclude the airport being updated
      $or: [{ name: name }, { code: code.toUpperCase() }],
    });

    if (duplicate) {
      return res
        .status(400)
        .json({ message: "Airport with same name or code already exists" });
    }

    const updatedAirport = await Airport.findByIdAndUpdate(
      id,
      {
        name,
        code: code.toUpperCase(), // Save code in uppercase consistently
        location,
        category,
      },
      { new: true, runValidators: true }
    );

    if (!updatedAirport) {
      return res.status(404).json({ message: "Airport not found" });
    }

    res.json(updatedAirport);
  } catch (err) {
    res.status(400).json({ message: "Invalid Data" });
  }
};

exports.deleteAirport = async (req, res) => {
  try {
    const airport = await Airport.findByIdAndDelete(req.params.id);
    if (!airport) return res.status(404).json({ message: "Airport Not Found" });
    res.json({ message: "Airport Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};
