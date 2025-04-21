const express = require("express");
const router = express.Router();
const XLSX = require("xlsx");
const Newsletter = require("../models/Newsletter"); // adjust if path differs

router.get("/newsletter/export", async (req, res) => {
  try {
    const subscribers = await Newsletter.find().lean();

    const data = subscribers.map((s, index) => ({
      "S.No": index + 1,
      Email: s.email,
      "Subscribed On": s.createdAt
        ? new Date(s.createdAt).toLocaleDateString()
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Subscribers");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=subscribers.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({ message: "Failed to generate Excel file" });
  }
});

module.exports = router;
