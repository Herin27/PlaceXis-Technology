// models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: String,
  email: String,
  rating: Number,
  message: String,
  status: {
    type: String,
    default: 'pending' // can be 'approved' or 'declined'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Review', reviewSchema);
