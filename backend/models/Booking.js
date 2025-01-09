// bookingModel.js

import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    trsactionid: {
      type: String,
      required: true,
      default: "123", // Provide a default value if userId is missing
    },
    userId: {
      type: String,
      required: false,
      default: "Unknown User", // Provide a default value if userId is missing
    },
    fullName: {
      type: String,
      required: false,
      default: "Guest", // Default value if no full name is provided
    },
    tourName: {
      type: String,
      required: true, // Ensure every booking has a tour name
      default: "Unnamed Tour", // Default tour name if not provided
    },
    totalPrice: {
      type: Number,
      required: true, // total price should always be provided
      default: 0, // Default price if not provided
    },
    maxGroupSize: {
      type: Number,
      required: false,
      default: 1, // Default group size of 1 if not provided
    },
    phone: {
      type: String,
      required: false,
      default: "N/A", // Default phone number if not provided
    },
    date: {
      type: String,
      required: true, // Ensure the date is provided
      default: () => new Date().toISOString().split("T")[0], // Default to current date
    },
    payment: {
      type: String,
      required: true, // Ensure payment status is provided
      default: "pending"
    },
    updatedAt: {
      type: Date,
      default: Date.now, // Default to current time if not provided
    },
    createdAt: {
      type: Date,
      default: Date.now, // Default to current time if not provided
    }
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
