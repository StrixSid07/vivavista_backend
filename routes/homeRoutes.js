const express = require("express");
const {
  getFeaturedDeals,
  getDestinations,
  getPopularDestinations,
  getReviews,
  getBlogs,
  getLatestBlogs,
  getHomepageData,
  subscribeNewsletter
} = require("../controllers/homeController");

const router = express.Router();

router.get("/deals/featured", getFeaturedDeals);
router.get("/destinations", getDestinations);
router.get("/destinations/popular", getPopularDestinations);
router.get("/reviews", getReviews);
router.get("/blogs", getBlogs);
router.get("/blogs/latest", getLatestBlogs);
router.get("/homepage", getHomepageData);
router.post("/subscribe-newsletter", subscribeNewsletter);

module.exports = router;
