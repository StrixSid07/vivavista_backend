const express = require("express");
const { protect, isAdmin } = require("../middleware/authMiddleware");
const { getAdminDashboardStats, getBookingTrends, getTopDeals } = require("../controllers/reportController");

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Admin reports & analytics
 */

/**
 * @swagger
 * /api/reports/dashboard-stats:
 *   get:
 *     summary: Get admin dashboard stats
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *       403:
 *         description: Admin access required
 */
// ✅ Get Admin Dashboard Overview
router.get("/dashboard-stats", protect, isAdmin, getAdminDashboardStats);

/**
 * @swagger
 * /api/reports/booking-trends:
 *   get:
 *     summary: Get booking trends over time
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Booking trends retrieved
 *       403:
 *         description: Admin access required
 */
router.get("/booking-trends", protect, isAdmin, getBookingTrends);

/**
 * @swagger
 * /api/reports/top-deals:
 *   get:
 *     summary: Get top performing deals
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Top deals retrieved
 *       403:
 *         description: Admin access required
 */
router.get("/top-deals", protect, isAdmin, getTopDeals);

module.exports = router;
