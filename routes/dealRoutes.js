const express = require("express");
const { protect, isAdmin } = require("../middleware/authMiddleware");
const {
  getAllDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
  getAllDealsAdmin,
  getDealsByDestination,
  searchDeals,
  deleteDealImage
} = require("../controllers/dealController");
// const upload = require("../middleware/imageUpload");
const { upload, uploadToS3 } = require("../middleware/imageUpload");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Deals
 *   description: Manage travel deals
 */

/**
 * @swagger
 * /api/deals:
 *   get:
 *     summary: Fetch all deals
 *     tags: [Deals]
 *     parameters:
 *       - name: country
 *         in: query
 *         schema:
 *           type: string
 *         example: "UK"
 *       - name: airport
 *         in: query
 *         schema:
 *           type: string
 *         example: "LHR"
 *     responses:
 *       200:
 *         description: Successfully retrieved deals
 */
router.get("/",getAllDeals);
// routes/deal.js
router.delete('/image/:dealId',protect, isAdmin, deleteDealImage);


/**
 * @swagger
 * /api/deals:
 *   get:
 *     summary: Fetch all deals
 *     tags: [Deals]
 *     parameters:
 *       - name: country
 *         in: query
 *         schema:
 *           type: string
 *         example: "UK"
 *       - name: airport
 *         in: query
 *         schema:
 *           type: string
 *         example: "LHR"
 *     responses:
 *       200:
 *         description: Successfully retrieved deals
 */
router.get("/admin", getAllDealsAdmin);

/**
 * @swagger
 * /api/deals/{id}:
 *   get:
 *     summary: Get a single deal by ID
 *     tags: [Deals]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "65a1234abcd5678"
 *     responses:
 *       200:
 *         description: Successfully retrieved deal
 *       404:
 *         description: Deal not found
 */
router.get("/:id", getDealById);

/**
 * @swagger
 * /api/deals:
 *   post:
 *     summary: Create a new deal (Admin)
 *     tags: [Deals]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Luxury Maldives Escape"
 *               description:
 *                 type: string
 *                 example: "A luxurious vacation package to the Maldives."
 *               availableCountries:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["UK", "USA"]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Deal created successfully
 *       403:
 *         description: Admin access required
 */
router.post("/",protect, isAdmin, upload.array("images", 5), createDeal);

/**
 * @swagger
 * /api/deals/{id}:
 *   put:
 *     summary: Update a deal (Admin)
 *     tags: [Deals]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "65a1234abcd5678"
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Maldives Escape"
 *               description:
 *                 type: string
 *                 example: "An exclusive luxury vacation package."
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Deal updated successfully
 *       403:
 *         description: Admin access required
 */
router.put("/:id",protect, isAdmin, upload.array("images", 5), updateDeal);

/**
 * @swagger
 * /api/deals/{id}:
 *   delete:
 *     summary: Delete a deal (Admin)
 *     tags: [Deals]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "65a1234abcd5678"
 *     responses:
 *       200:
 *         description: Deal deleted
 *       403:
 *         description: Admin access required
 */
router.delete("/:id",protect, isAdmin, deleteDeal);

router.get("/destination/:destinationId", getDealsByDestination);

router.get("/search", searchDeals);

module.exports = router;
