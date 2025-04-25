const Holiday = require("../models/Holiday");
const Deal = require("../models/Deal");

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

exports.getFilterDealsByHoliday = async (req, res) => {
  try {
    const rawName = req.query.name;

    if (!rawName || typeof rawName !== "string") {
      return res
        .status(400)
        .json({ message: "Holiday category name is required" });
    }

    const name = rawName.trim();

    if (!name) {
      return res
        .status(400)
        .json({ message: "Holiday category name cannot be empty" });
    }

    // Case-insensitive search
    const holidayCategory = await Holiday.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (!holidayCategory) {
      return res
        .status(404)
        .json({ message: `Holiday category '${name}' not found` });
    }

    // Fetch deals by holiday ID, and populate prices.hotel
    const deals = await Deal.find({
      holidaycategories: holidayCategory._id,
    })
      .select("title images days prices tag isTopDeal isHotdeal")
      .populate("destination", "name")
      .populate("boardBasis", "name")
      .populate("prices.hotel", "tripAdvisorRating tripAdvisorReviews");

    // Manually filter out unwanted fields from prices[]
    const cleanedDeals = deals.map((deal) => {
      const cleanedPrices = deal.prices.map((price) => ({
        _id: price._id,
        price: price.price,
        hotel: price.hotel,
      }));

      return {
        _id: deal._id,
        title: deal.title,
        images: deal.images,
        days: deal.days,
        prices: cleanedPrices,
        boardBasis: deal.boardBasis,
        tag: deal.tag,
        isTopDeal: deal.isTopDeal,
        isHotdeal: deal.isHotdeal,
        destination: deal.destination,
      };
    });

    res.status(200).json(cleanedDeals);
  } catch (error) {
    console.error("Error in getFilterDealsByHoliday:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
