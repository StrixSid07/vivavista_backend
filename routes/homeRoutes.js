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
} = require("../controllers/homeController");
const { upload, uploadToS3 } = require("../middleware/imageUpload");
const router = express.Router();

router.get("/deals/featured", getFeaturedDeals);
router.get("/destinations", getDestinations);
router.get("/destinations/popular", getPopularDestinations);
router.get("/reviews", getReviews);
router.get("/blogs", getBlogs);
router.get("/blogs/:id", getBlogById);
router.post("/blogs", upload.single("images"), addBlog);
router.get("/blogs/latest", getLatestBlogs);
router.get("/homepage", getHomepageData);
router.post("/subscribe-newsletter", subscribeNewsletter);
router.delete("/image/:blogId", deleteBlogImage);
router.put("/:id", upload.single("images"), updateBlog); // 🔄 Update
router.delete("/blogs/:id", deleteBlog);
module.exports = router;
