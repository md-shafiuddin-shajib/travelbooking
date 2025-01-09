import Review from '../models/Review.js';
import Tour from '../models/Tour.js';

// Create a review
const createReview = async (req, res) => {
  try {
    const { username, rating, reviewText } = req.body;
    const tourId = req.params.tourId;

    // Validate required fields
    if (!tourId || !rating) {
      return res.status(400).json({ message: 'Tour ID and rating are required' });
    }

    // Find the corresponding tour
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ message: 'Tour not found' });
    }

    // Create a new review
    const newReview = new Review({ tourId, reviewText, rating, username });
    await newReview.save();

    // Update the tour with the new review
    tour.reviews.push(newReview._id);
    await tour.save();

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      newReview,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// Delete a review by ID
const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    // Validate review ID
    if (!reviewId) {
      return res.status(400).json({ message: 'Review ID is required' });
    }

    // Find and delete the review
    const deletedReview = await Review.findByIdAndDelete(reviewId);

    if (!deletedReview) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// Fetch the latest 5-star reviews
export const getLatestFiveStarReviews = async (req, res) => {
  try {
    const latestFiveStarReviews = await Review.find({ rating: 5 })
      .sort({ createdAt: -1 }) // Sort by most recent
      .limit(5) // Limit to 5 reviews
      .populate('tourId', 'title'); // Populate the tour title from the Tour model

    console.log('Latest 5-Star Reviews:', latestFiveStarReviews); // Log the fetched reviews

    if (!latestFiveStarReviews.length) {
      return res.status(404).json({
        success: false,
        message: 'No 5-star reviews found',
      });
    }

    res.status(200).json({
      success: true,
      data: latestFiveStarReviews,
    });
  } catch (error) {
    console.error('Error fetching 5-star reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};

export { createReview, deleteReview };
