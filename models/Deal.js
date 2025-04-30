const mongoose = require("mongoose");

const ItineraryItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const DealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }], // Image URLs
    availableCountries: [{ type: String, required: true }], // ['UK', 'USA', 'Canada']
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: false,
    },
    holidaycategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Holiday",
      },
    ],
    days: {
      type: Number,
      require: true,
    },
    rooms: { type: Number, require: true },
    guests: {
      type: Number,
      require: true,
    },
    // Airport-based pricing & flight details
    prices: [
      {
        priceswitch: { type: Boolean, default: false },
        country: { type: String, required: true },
        airport: [{ type: mongoose.Schema.Types.ObjectId, ref: "Airport" }],
        hotel: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Hotel",
          required: true,
        },
        startdate: { type: Date, required: true },
        enddate: { type: Date, required: true },
        price: { type: Number, required: true },
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
    ],

    // Accommodations
    hotels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hotel" }],

    boardBasis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BoardBasis",
      required: true,
    },
    tag: { type: String },
    LowDeposite: { type: String },
    isTopDeal: { type: Boolean, default: false },
    isHotdeal: { type: Boolean, default: false },
    itinerary: {
      type: [ItineraryItemSchema],
      default: [],
      required: false,
    },
    isFeatured: { type: Boolean, default: false },
    distanceToCenter: { type: String }, // Example: "500m away"
    distanceToBeach: { type: String }, // Example: "300m away"
    whatsIncluded: [{ type: String }], // List of included features
    exclusiveAdditions: [{ type: String }], // List of optional extras or upgrades
    termsAndConditions: [{ type: String }], //  List of T&Cs
  },
  { timestamps: true }
);

module.exports = mongoose.model("Deal", DealSchema);
