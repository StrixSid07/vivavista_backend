const Deal = require("../models/Deal");
const Destination = require("../models/Destination");
const Review = require("../models/Review");
const Blog = require("../models/Blog");
const Newsletter = require("../models/Newsletter");
const { uploadToS3, deleteFromS3 } = require("../middleware/imageUpload");
require("dotenv").config();
const validator = require("validator");

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

exports.getBlogById = async (req, res) => {
  try {
    const blogId = req.params.id;
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.json(blog);
  } catch (error) {
    console.error("Error fetching blog by ID:", error);
    res.status(500).json({ error: "Failed to fetch blog" });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {}
};
exports.addBlog = async (req, res) => {
  const { title, content } = req.body;
  console.log(req.body);
  try {
    let imageUrl = "";

    const IMAGE_STORAGE = process.env.IMAGE_STORAGE || "local";
    if (req.file) {
      if (IMAGE_STORAGE === "s3") {
        imageUrl = await uploadToS3(req.file); // Assuming this returns a string URL
      } else {
        imageUrl = `/uploads/${req.file.filename}`;
      }
    }
    const blog = new Blog({
      title,
      content,
      image: imageUrl,
    });
    blog.save();
    res.status(201).json({ message: "Blog created successfully", blog: blog });
  } catch (error) {
    res.status(500).json({ error: "Failed to create blogs" });
  }
};
exports.updateBlog = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
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

    if (title) blog.title = title;
    if (content) blog.content = content;

    if (imageUrl) blog.image = imageUrl;

    await blog.save();
    res.json({ message: "Blog updated successfully", blog });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Server error" });
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
// exports.getHomepageData = async (req, res) => {
//   try {
//     const featuredDeals = await Deal.find({ isFeatured: true })
//     .populate({
//       path: "destination",
//       select: "name", // Only fetch name & image from Destination
//     })
//     .limit(6);
//     const destinations = await Destination.find()
//       .populate({
//         path: "deals",
//         model: "Deal",
//       })
//       .limit(6);
//     const reviews = await Review.find().limit(6);
//     const blogs = await Blog.find().sort({ createdAt: -1 }).limit(3);

//     res.json({
//       featuredDeals,
//       destinations,
//       reviews,
//       blogs,
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch homepage data" });
//   }
// };
exports.getHomepageData = async (req, res) => {
  try {
    // Get featured deals (limit 6)
    const featuredDeals = await Deal.find({ isFeatured: true })
      .select("title images isHotdeal isTopDeal destination prices days tag")
      .populate({
        path: "destination",
        select: "name image", // Destination name & image only
      })
      .populate({
        path: "boardBasis",
        select: "name",
      })
      .populate({
        path: "prices.hotel", // Populating hotel in prices array
        select: "name tripAdvisorRating tripAdvisorReviews", // Include rating & review count
      })
      .limit(7);

    // Get destinations (limit 6), with associated deals
    const destinations = await Destination.find()
      .select("name image isPopular")
      .populate({
        path: "deals",
        select: "title images isHotdeal isTopDeal destination prices days tag",
        populate: [
          {
            path: "destination",
            select: "name image",
          },
          {
            path: "boardBasis",
            select: "name",
          },
          {
            path: "prices.hotel",
            select: "name tripAdvisorRating tripAdvisorReviews",
          },
        ],
      })
      .limit(7);
    console.log(destinations);
    // Get reviews (limit 6)
    const reviews = await Review.find()
      .select("name comment rating createdAt")
      .limit(6);

    // Get latest blogs (limit 3)
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .select("title image shortDescription createdAt")
      .limit(3);

    // Response
    res.json({
      featuredDeals,
      destinations,
      reviews,
      blogs,
    });
  } catch (error) {
    console.error("Homepage Data Error:", error);
    res.status(500).json({ error: "Failed to fetch homepage data" });
  }
};
exports.deleteBlogImage = async (req, res) => {
  const { blogId } = req.params;

  try {
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: "Destination not found" });
    }

    const imageUrl = blog.image;

    // Optional: Delete from S3 or any cloud storage
    await deleteFromS3(imageUrl);

    // Remove image URL from MongoDB
    blog.image = "";
    await blog.save();

    console.log("Image deleted successfully");
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
/** ✅ Subscribe to Newsletter */
// exports.subscribeNewsletter = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email || !email.includes("@")) {
//       return res.status(400).json({ message: "Invalid email format" });
//     }
//     await Newsletter.create({ email });
//     res.json({ message: "Subscription successful!" });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to subscribe to newsletter" });
//   }
// };

exports.subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const existing = await Newsletter.findOne({ email: sanitizedEmail });
    if (existing) {
      return res.status(409).json({ message: "Email already subscribed" });
    }

    await Newsletter.create({ email: sanitizedEmail });
    res.json({ message: "Subscription successful!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to subscribe to newsletter" });
  }
};

// Get all newsletter subscribers
exports.getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
};

// Update subscriber email
exports.updateSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const sanitizedEmail = email.trim().toLowerCase();

    const updated = await Newsletter.findByIdAndUpdate(
      id,
      { email: sanitizedEmail },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Subscriber not found" });
    }

    res.json({ message: "Subscriber updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to update subscriber" });
  }
};

// Delete subscriber
exports.deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Newsletter.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Subscriber not found" });
    }

    res.json({ message: "Subscriber deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete subscriber" });
  }
};
