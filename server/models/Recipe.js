const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  cacheKey: { type: String, required: true, unique: true },
  recipes: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 },
});

module.exports = mongoose.model("Recipe", recipeSchema);
