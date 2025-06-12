const express = require('express');
const router = express.Router();
const Review = require('./models/Review');

router.post('/submit-review', async (req, res) => {
  try {
    const { name, email, rating, message } = req.body;
    const newReview = new Review({ name, email, rating, message });
    await newReview.save();
    res.status(200).json({ message: "Review submitted successfully" });
  } catch (error) {
    console.error("Review submission error:", error);
    res.status(500).json({ message: "Error submitting review" });
  }
});

module.exports = router;
