const mongoose = require("mongoose");

const BoardBasisSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BoardBasis", BoardBasisSchema);
