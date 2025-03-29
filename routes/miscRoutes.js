const express = require("express");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Miscellaneous
 *   description: Miscellaneous routes for session-based country selection
 */

/**
 * @swagger
 * /api/misc/set-country:
 *   post:
 *     summary: Set country in session
 *     tags: [Miscellaneous]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               country:
 *                 type: string
 *                 enum: [UK, USA, Canada]
 *                 example: "UK"
 *     responses:
 *       200:
 *         description: Country set successfully
 *       400:
 *         description: Invalid country selection
 */
router.post("/set-country", (req, res) => {
  const { country } = req.body;
  if (!["UK", "USA", "Canada"].includes(country)) {
    return res.status(400).json({ message: "Invalid country selection." });
  }
  req.session.country = country;
  res.json({ message: `Country set to ${country}` });
});

/**
 * @swagger
 * /api/misc/get-country:
 *   get:
 *     summary: Get currently selected country from session
 *     tags: [Miscellaneous]
 *     responses:
 *       200:
 *         description: Returns selected country
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 country:
 *                   type: string
 *                   example: "UK"
 */
router.get("/get-country", (req, res) => {
  res.json({ country: req.session.country || "UK" });
});

module.exports = router;
