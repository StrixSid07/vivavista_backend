const mongoose = require("mongoose");

const DestinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    image: { type: String }, // Destination Image
    isPopular: { type: Boolean, default: false }, // Popular Flag
    deals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Deal' }] // Linking deals

  },
  { timestamps: true }
);

module.exports = mongoose.model("Destination", DestinationSchema);
