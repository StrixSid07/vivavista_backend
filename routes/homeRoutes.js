const express = require("express");
const {
  getFeaturedDeals,
  getDestinations,
  getPopularDestinations,
  getReviews,
  getBlogs,
  getLatestBlogs,
  getHomepageData,
  subscribeNewsletter,
  addBlog,
  getBlogById,
  deleteBlogImage,
  updateBlog,
  deleteBlog,
  getAllSubscribers,
  updateSubscriber,
  deleteSubscriber,
} = require("../controllers/homeController");
const { upload, uploadToS3 } = require("../middleware/imageUpload");
const router = express.Router();
const { protect, isAdmin } = require("../middleware/authMiddleware");

router.get("/deals/featured", getFeaturedDeals);
router.get("/destinations", getDestinations);
router.get("/destinations/popular", getPopularDestinations);
router.get("/reviews", getReviews);
router.get("/blogs", getBlogs);
router.get("/blogs/:id", getBlogById);
router.post("/blogs", upload.single("images"), protect, isAdmin, addBlog);
router.delete("/image/:blogId", protect, isAdmin, deleteBlogImage);
router.put("/:id", upload.single("images"), protect, isAdmin, updateBlog); // 🔄 Update
router.delete("/blogs/:id", protect, isAdmin, deleteBlog);
router.get("/blogs/latest", getLatestBlogs);
router.get("/homepage", getHomepageData);
router.post("/subscribe-newsletter", subscribeNewsletter);
router.get("/newsletter", protect, isAdmin, getAllSubscribers);
router.put("/newsletter/:id", protect, isAdmin, updateSubscriber);
router.delete("/newsletter/:id", protect, isAdmin, deleteSubscriber);
module.exports = router;
