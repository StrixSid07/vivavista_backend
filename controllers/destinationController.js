const Destination = require("../models/Destination");
const Deal = require("../models/Deal");

const { uploadToS3, deleteFromS3 } = require("../middleware/imageUpload");
require("dotenv").config();
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
    const destinations = await Destination.find({}, "_id name").sort({
      name: 1,
    });
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteDestinationImage = async (req, res) => {
  const { destinationId } = req.params;

  try {
    const destination = await Destination.findById(destinationId);

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    const imageUrl = destination.image;

    // Optional: Delete from S3 or any cloud storage
    await deleteFromS3(imageUrl);

    // Remove image URL from MongoDB
    destination.image = "";
    await destination.save();

    console.log("Image deleted successfully");
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.addDestination = async (req, res) => {
  const { name, isPopular } = req.body;
  try {
    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }
    let imageUrl = "";

    const IMAGE_STORAGE = process.env.IMAGE_STORAGE || "local";
    if (req.file) {
      if (IMAGE_STORAGE === "s3") {
        imageUrl = await uploadToS3(req.file); // Assuming this returns a string URL
      } else {
        imageUrl = `/uploads/${req.file.filename}`;
      }
    }

    const destination = new Destination({
      name,
      isPopular,
      image: imageUrl,
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
  const { name, isPopular } = req.body;

  try {
    const destination = await Destination.findById(id);

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }
    let imageUrl = "";

    const IMAGE_STORAGE = process.env.IMAGE_STORAGE || "local";
    if (req.file) {
      if (IMAGE_STORAGE === "s3") {
        imageUrl = await uploadToS3(req.file); // Assuming this returns a string URL
      } else {
        imageUrl = `/uploads/${req.file.filename}`;
      }
    }

    if (name) destination.name = name;
    if (typeof isPopular !== "undefined") destination.isPopular = isPopular;
    if (imageUrl) destination.image = imageUrl;

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

exports.getFilterDealsByDestination = async (req, res) => {
  try {
    const rawName = req.query.name;

    if (!rawName || typeof rawName !== "string") {
      return res.status(400).json({ message: "Destination name is required" });
    }

    const name = rawName.trim();

    if (!name) {
      return res
        .status(400)
        .json({ message: "Destination name cannot be empty" });
    }

    // Case-insensitive search
    const destination = await Destination.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (!destination) {
      return res
        .status(404)
        .json({ message: `Destination '${name}' not found` });
    }

    // Fetch deals by destination ID, and populate prices.hotel
    const deals = await Deal.find({
      destination: destination._id,
    })
      .select("title destination images days prices tag isTopDeal isHotdeal")
      .populate("holidaycategories", "name")
      .populate("boardBasis", "name")
      .populate("prices.hotel", "tripAdvisorRating tripAdvisorReviews")
      .populate("destination", "name");

    // Clean up prices array
    const cleanedDeals = deals.map((deal) => {
      const cleanedPrices = deal.prices.map((price) => ({
        _id: price._id,
        price: price.price,
        hotel: price.hotel,
      }));

      return {
        _id: deal._id,
        title: deal.title,
        destination: { name: destination.name },
        images: deal.images,
        days: deal.days,
        prices: cleanedPrices,
        boardBasis: deal.boardBasis,
        tag: deal.tag,
        isTopDeal: deal.isTopDeal,
        isHotdeal: deal.isHotdeal,
        holidaycategories: deal.holidaycategories,
      };
    });

    res.status(200).json(cleanedDeals);
  } catch (error) {
    console.error("Error in getFilterDealsByDestination:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
