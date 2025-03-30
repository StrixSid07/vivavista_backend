const Deal = require("../models/Deal");
const Destination = require("../models/Destination");
const Review = require("../models/Review");
const Blog = require("../models/Blog");
const Newsletter = require("../models/Newsletter");

/** ✅ Get Featured Deals */
exports.getFeaturedDeals = async (req, res) => {
  try {
    const deals = await Deal.find({ isFeatured: true }).limit(6);
    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch featured deals" });
  }
};

/** ✅ Get All Destinations */
exports.getDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find();
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch destinations" });
  }
};

/** ✅ Get Popular Destinations */
exports.getPopularDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find({ isPopular: true }).limit(6);
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch popular destinations" });
  }
};

/** ✅ Get Reviews */
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().limit(6);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

/** ✅ Get All Blogs */
exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
};

/** ✅ Get Latest Blogs */
exports.getLatestBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).limit(3);
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch latest blogs" });
  }
};

/** ✅ Get Homepage Data */
exports.getHomepageData = async (req, res) => {
  try {
    const featuredDeals = await Deal.find({ isFeatured: true }).limit(6);
    const destinations = await Destination.find()
      .populate({
        path: "deals",
        model: "Deal",
      })
      .limit(6);
    const reviews = await Review.find().limit(6);
    const blogs = await Blog.find().sort({ createdAt: -1 }).limit(3);

    res.json({
      featuredDeals,
      destinations,
      reviews,
      blogs,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch homepage data" });
  }
};

/** ✅ Subscribe to Newsletter */
exports.subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    await Newsletter.create({ email });
    res.json({ message: "Subscription successful!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to subscribe to newsletter" });
  }
};
