const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    dealId: { type: mongoose.Schema.Types.ObjectId, ref: "Deal", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // Null for guest users

    // Personal Information
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    // Travel Information
    country: { type: String, required: true }, // User's selected country
    airport: { type: String, required: true }, // Selected departure airport
    selectedDate: { type: Date, required: true },
    returnDate: { type: Date, required: true }, // Return date

    // Passenger Information
    adults: { type: Number, required: true, min: 1 },
    children: { type: Number, required: true, min: 0 },

    // Selected Hotel (if applicable)
    selectedHotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: false },

    // Selected Price (Based on airport & date)
    selectedPrice: {
      price: { type: Number, required: true },
      flightDetails: {
        outbound: { departureTime: String, arrivalTime: String, airline: String, flightNumber: String },
        returnFlight: { departureTime: String, arrivalTime: String, airline: String, flightNumber: String },
      },
    },

    // Booking Status
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
