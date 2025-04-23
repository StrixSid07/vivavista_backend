const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    }, // Null for guest users

    // Personal Information
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: false },
    airport: { type: String, required: true }, // Selected departure airport
    selectedDate: { type: Date, required: true },
    returnDate: { type: Date, required: false }, // Return date

    // Passenger Information
    adults: { type: Number, required: true, min: 1 },
    children: { type: Number, required: false, min: 0 },

    // Selected Hotel (if applicable)
    selectedHotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: false,
    },

    // Selected Price (Based on airport & date)
    selectedPrice: {
      price: { type: Number, required: false },
      flightDetails: {
        outbound: {
          departureTime: String,
          arrivalTime: String,
          airline: String,
          flightNumber: String,
        },
        returnFlight: {
          departureTime: String,
          arrivalTime: String,
          airline: String,
          flightNumber: String,
        },
      },
    },

    // Booking Status
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", BookingSchema);
