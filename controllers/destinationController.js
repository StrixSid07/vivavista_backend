const Destination = require("../models/Destination");

exports.getDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find().populate("deals");
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getDestinationDropdown = async (req, res) => {
  try {
    const destinations = await Destination.find(
      {},
      "_id name image isPopular"
    ).sort({ name: 1 });
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.addDestination = async (req, res) => {
  const { name, isPopular, imageUrls } = req.body;
  try {
    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }
    const destination = new Destination({
      name,
      isPopular,
      image: imageUrls,
    });
    await destination.save();
    return res.status(201).json({ message: "created succefully destination" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
};

exports.updateDestination = async (req, res) => {
  const { id } = req.params;
  const { name, isPopular, imageUrls } = req.body;

  try {
    const destination = await Destination.findById(id);

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    if (name) destination.name = name;
    if (typeof isPopular !== "undefined") destination.isPopular = isPopular;
    if (imageUrls) destination.image = imageUrls;

    await destination.save();
    res.json({ message: "Destination updated successfully", destination });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteDestination = async (req, res) => {
  const { id } = req.params;

  try {
    const destination = await Destination.findByIdAndDelete(id);

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    res.json({ message: "Destination deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
