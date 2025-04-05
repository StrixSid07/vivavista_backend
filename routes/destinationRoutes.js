const express = require("express");
const router = express.Router();
const {
  getDestinations,
  addDestination,
  getDestinationDropdown,
  updateDestination,
  deleteDestination,
} = require("../controllers/destinationController");

router.get("/destinations", getDestinations);
router.get("/dropdown-destionation", getDestinationDropdown);
router.post("/", addDestination);
router.put("/:id", updateDestination); // 🔄 Update
router.delete("/:id", deleteDestination); // 🗑️ Delete
module.exports = router;
