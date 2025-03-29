const express = require('express');
const router = express.Router();
const { getDestinations,addDestination } = require('../controllers/destinationController');

router.get('/destinations', getDestinations);
router.post('/',addDestination);
module.exports = router;
