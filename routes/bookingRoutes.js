const express = require("express");
const { protect, isAdmin } = require("../middleware/authMiddleware");
const {
  createBooking,
  createBookingByAdmin,
  getUserBookings,
  getAllBookings,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
  getDealsDropdown,
} = require("../controllers/bookingController");

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Manage user bookings
 */
/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dealId:
 *                 type: string
 *                 example: "65a1234abcd5678"
 *               airport:
 *                 type: string
 *                 example: "LHR"
 *               selectedDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-04-10"
 *               returnDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-04-17"
 *               adults:
 *                 type: number
 *                 example: 2
 *               children:
 *                 type: number
 *                 example: 1
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Invalid booking data
 */
// ✅ User Booking (Logged-in or Guest)
router.post("/", createBooking);
router.post("/createbyadmin", protect, isAdmin, createBookingByAdmin);
// ✅ Get Bookings for Logged-in Users
router.get("/my-bookings", protect, getUserBookings);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all user bookings
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of user bookings
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings (Admin)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all bookings
 *       403:
 *         description: Admin access required
 */
router.get("/", protect, isAdmin, getAllBookings);
router.get("/deals", protect, isAdmin, getDealsDropdown);

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   put:
 *     summary: Update booking status (Admin)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "65b5678efgh9123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled]
 *                 example: "confirmed"
 *     responses:
 *       200:
 *         description: Booking status updated
 *       403:
 *         description: Admin access required
 */
router.put("/:id/status", protect, isAdmin, updateBookingStatus);
router.put("/update/:id", protect, isAdmin, updateBooking);

router.delete("/:id", protect, isAdmin, deleteBooking);

module.exports = router;
