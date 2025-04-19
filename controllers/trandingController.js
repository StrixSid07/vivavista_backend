const mongoose = require("mongoose");
const Deal = require("../models/Deal");

exports.getHotDeals = async (req, res) => {
  try {
    const deals = await Deal.find({ isHotDeal: true }).populate(
      "destination",
      "name"
    );

    deals.sort((a, b) => a.destination.name.localeCompare(b.destination.name));

    res.json(deals);
  } catch {
    res
      .status(500)
      .json({ message: "Error fetching Top deals by destination", error });
  }
};

exports.getTopDeals = async (req, res) => {
  try {
    const deals = await Deal.find({ isTopDeal: true })
      .populate("prices.hotel")
      .populate("destination", "name")
      .select(
        "title destination description prices boardBasis days images isTopDeal isHotdeal"
      );

    res.json(deals);
  } catch {
    res
      .status(500)
      .json({ message: "Error fetching Top deals by destination", error });
  }
};

// exports.getTopdealByDestination = async (req, res) => {
//   try {
//     const { destinationId, dealId } = req.params;

//     // Build the query object
//     const query = { destination: destinationId, isTopDeal: true };

//     // If a dealId is provided, filter it out from the results
//     if (dealId) {
//       query._id = { $ne: dealId };
//     }

//     const deals = await Deal.find(query)
//       .populate("destination")
//       .populate("prices.hotel")
//       .populate("hotels")
//       .limit(6);

//     res.json(deals);
//   } catch (error) {
//     res.status(500).json({
//       message: "Error fetching Top deals by destination",
//       error: error.message,
//     });
//   }
// };

exports.getTopDealsByDestination = async (req, res) => {
  try {
    const { destinationId, dealId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(destinationId)) {
      return res.status(400).json({ message: "Invalid destinationId" });
    }

    const query = {
      destination: new mongoose.Types.ObjectId(destinationId),
      isTopDeal: true,
    };

    // Exclude this deal from results
    if (dealId && mongoose.Types.ObjectId.isValid(dealId)) {
      query._id = { $ne: new mongoose.Types.ObjectId(dealId) };
    }

    const deals = await Deal.find(query)
      .limit(6)
      .populate("destination")
      .populate("prices.hotel")
      .populate("hotels");

    return res.json(deals);
  } catch (error) {
    console.error("getTopDealsByDestination error:", error);
    return res.status(500).json({
      message: "Error fetching top deals for destination",
      error: error.message,
    });
  }
};
