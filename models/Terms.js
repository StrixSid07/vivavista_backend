const mongoose = require("mongoose");

// Child List Schema
const childListSchema = new mongoose.Schema({
  item: {
    type: String,
  },
});

// Sublist Schema
const sublistSchema = new mongoose.Schema({
  item: {
    type: String,
  },
  childLists: [childListSchema], // Directly include child lists
});

// Content Schema
const contentSchema = new mongoose.Schema({
  paragraph: {
    type: String,
  },
  linkTitle: {
    type: String,
    default: "",
  },
  links: {
    type: [String],
    default: [],
  },
  contactNumber: {
    type: String,
    default: "",
  },
  lists: {
    type: [String],
    default: [],
  },
  sublists: [sublistSchema], // Directly include sublists
});

// Term Data Schema
const termDataSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  content: [contentSchema], // Directly include content
});

// Main Term Schema
const termSchema = new mongoose.Schema(
  {
    mainTitle: {
      type: String,
    },
    data: [termDataSchema], // Directly include term data
  },
  { timestamps: true }
);

// Export the Term model
module.exports = mongoose.model("Term", termSchema);
