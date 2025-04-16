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
      .select(
        "title tag description prices boardBasis days images isTopDeal isHotdeal"
      );

    res.json(deals);
  } catch {
    res
      .status(500)
      .json({ message: "Error fetching Top deals by destination", error });
  }
};

exports.getTopdealByDestination = async (req, res) => {
  try {
    const { destinationId, dealId } = req.params;

    // Build the query object
    const query = { destination: destinationId, isTopDeal: true };

    // If a dealId is provided, filter it out from the results
    if (dealId) {
      query._id = { $ne: dealId };
    }

    const deals = await Deal.find(query)
      .populate("destination")
      .populate("prices.hotel")
      .populate("hotels")
      .limit(6);

    res.json(deals);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching Top deals by destination",
      error: error.message,
    });
  }
};
