import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    tourId: { // Change from productId to tourId
      type: mongoose.Types.ObjectId,
      ref: "Tour",
      required: true // Ensuring the reference to Tour is required
    },
    username: {
      type: String,
      required: true,
    },
    reviewText: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  { timestamps: true } // Automatically creates createdAt and updatedAt fields
);

export default mongoose.model("Review", reviewSchema);
