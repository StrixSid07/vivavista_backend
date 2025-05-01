const mongoose = require("mongoose");

const TermSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  sequenceNumber: { type: Number, required: true, unique: true },
});

module.exports = mongoose.model("Term", TermSchema);
