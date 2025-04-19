const express = require("express");
const { protect, isAdmin } = require("../middleware/authMiddleware");
const {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  deleteHotelImage
} = require("../controllers/hotelController");

const router = express.Router();
const { upload, uploadToS3 } = require("../middleware/imageUpload");
/**
 * @swagger
 * tags:
 *   name: Hotels
 *   description: Manage hotel listings
 */

/**
 * @swagger
 * /api/hotels:
 *   post:
 *     summary: Create a new hotel (Admin)
 *     tags: [Hotels]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Hilton Grand"
 *               location:
 *                 type: string
 *                 example: "Las Vegas, USA"
 *               locationId:
 *                 type: string
 *                 example: "123456789"
 *     responses:
 *       201:
 *         description: Hotel created successfully
 *       403:
 *         description: Admin access required
 */
router.post("/", protect, isAdmin,upload.array("images", 5),createHotel);
/**
 * @swagger
 * tags:
 *   name: Hotels
 *   description: Manage hotels (public & admin)
 */

/**
 * @swagger
 * /api/hotels:
 *   get:
 *     summary: Get all hotels
 *     tags: [Hotels]
 *     responses:
 *       200:
 *         description: Successfully retrieved hotels
 */
router.get("/", getHotels);

/**
 * @swagger
 * /api/hotels/{id}:
 *   get:
 *     summary: Get a hotel by ID
 *     tags: [Hotels]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "65b5678efgh9123"
 *     responses:
 *       200:
 *         description: Successfully retrieved hotel details
 *       404:
 *         description: Hotel not found
 */
router.get("/:id", getHotelById);

/**
 * @swagger
 * /api/hotels/{id}:
 *   put:
 *     summary: Update a hotel (Admin)
 *     tags: [Hotels]
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
 *               name:
 *                 type: string
 *                 example: "Updated Hilton Grand"
 *               location:
 *                 type: string
 *                 example: "Las Vegas, USA"
 *     responses:
 *       200:
 *         description: Hotel updated successfully
 *       403:
 *         description: Admin access required
 */
// router.put("/:id", protect, isAdmin, updateHotel);

router.put("/:id", protect, isAdmin,upload.array("images", 5),updateHotel);
router.delete('/image/:hotelId',protect, isAdmin, deleteHotelImage);
/**
 * @swagger
 * /api/hotels/{id}:
 *   delete:
 *     summary: Delete a hotel (Admin)
 *     tags: [Hotels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "65b5678efgh9123"
 *     responses:
 *       200:
 *         description: Hotel deleted successfully
 *       403:
 *         description: Admin access required
 */
router.delete("/:id",protect, isAdmin, deleteHotel);

module.exports = router;
