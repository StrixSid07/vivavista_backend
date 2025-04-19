const express = require('express');
const route = express.Router();
const { sendContactMessage } = require("../controllers/contactController");


route.post("/contactus", sendContactMessage);


module.exports = route;