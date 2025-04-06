const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      default: "",
    },
    lists: {
      type: [String],
      default: [],
    },
    linktitle: {
      type: [String],
      default: [],
    },
    links: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Faq", faqSchema);
