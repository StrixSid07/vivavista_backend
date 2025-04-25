const express = require("express");
const route = express.Router();
const {
  sendContactMessage,
  sendGroupBookingInquiry,
  sendSubscribeMessage,
} = require("../controllers/contactController");

route.post("/contactus", sendContactMessage);
route.post("/groupbookinginquiry", sendGroupBookingInquiry);
route.post("/send-subscribe-message", sendSubscribeMessage);

module.exports = route;
