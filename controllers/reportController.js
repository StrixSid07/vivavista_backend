const User = require("../models/User");
const Deal = require("../models/Deal");
const Booking = require("../models/Booking");

// ✅ Get Admin Dashboard Overview
const getAdminDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDeals = await Deal.countDocuments();
    const totalBookings = await Booking.countDocuments();

    res.json({ totalUsers, totalDeals, totalBookings });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get Booking Trends Over Time
const getBookingTrends = async (req, res) => {
  try {
    const trends = await Booking.aggregate([
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          totalBookings: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get Top Performing Deals
const getTopDeals = async (req, res) => {
  try {
    const topDeals = await Booking.aggregate([
      { $group: { _id: "$dealId", totalBookings: { $sum: 1 } } },
      { $sort: { totalBookings: -1 } },
      { $limit: 5 }, // Get top 5 deals
      {
        $lookup: {
          from: "deals",
          localField: "_id",
          foreignField: "_id",
          as: "deal",
        },
      },
      { $unwind: "$deal" },
      {
        $project: {
          _id: "$deal._id",
          title: "$deal.title",
          totalBookings: 1,
        },
      },
    ]);

    res.json(topDeals);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getAdminDashboardStats, getBookingTrends, getTopDeals };
