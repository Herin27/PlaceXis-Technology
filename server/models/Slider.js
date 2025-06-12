const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema({
  title: String,
  description: String,
  imageUrl: String, // stored path or URL
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Slider', sliderSchema);
