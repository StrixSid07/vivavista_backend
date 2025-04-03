const express = require('express');
const router = express.Router();
const { getDestinations,addDestination, getDestinationDropdown } = require('../controllers/destinationController');

router.get('/destinations', getDestinations);
router.get('/dropdown-destionation', getDestinationDropdown);
router.post('/',addDestination);
module.exports = router;
