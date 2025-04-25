const express = require("express");
const route = express.Router();
const {
  sendContactMessage,
  sendGroupBookingInquiry,
  sendSubscribeMessage,
  sendBookingConfirmation,
} = require("../controllers/contactController");

route.post("/contactus", sendContactMessage);
route.post("/groupbookinginquiry", sendGroupBookingInquiry);
route.post("/send-subscribe-message", sendSubscribeMessage);
route.post("/send-booking-info", sendBookingConfirmation);

module.exports = route;
