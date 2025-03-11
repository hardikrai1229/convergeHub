const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  content: String,
  operations: Array,
});

module.exports = mongoose.model("Document", documentSchema);
