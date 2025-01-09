import Booking from "../models/Booking.js";
import SSLCommerzPayment from 'sslcommerz-lts';
import dotenv from 'dotenv';

dotenv.config();

const { STORE_ID, STORE_PASSWORD, SERVER_URL, FRONTEND_URL } = process.env;

const sslcz = new SSLCommerzPayment(STORE_ID, STORE_PASSWORD);

// Initiate payment and create a pending booking
const initiatePayment = async (req, res) => {
  try {
    const {
      userId,
      fullName,
      phone,
      date,
      totalPrice,
      tourName,
      maxGroupSize,
      babyCount,
    } = req.body;

    const tran_id = `TRAN_${Date.now()}`;

    // Create a pending booking
    const pendingBooking = new Booking({
      userId,
      fullName,
      phone,
      date: date || new Date().toISOString().split("T")[0], // Use today's date if none is provided
      totalPrice,
      tourName,
      maxGroupSize,
      babyCount: babyCount || 0,
      status: 'pending', // Mark booking as pending until payment is completed
      transactionId: tran_id,
    });

    await pendingBooking.save(); // Save pending booking to database

    // Prepare SSLCommerz payment data
    const sslData = {
      total_amount: totalPrice,
      currency: 'BDT',
      tran_id: tran_id, // Transaction ID for tracking
      success_url: `${SERVER_URL}/api/payment/success`, // URL for payment success
      fail_url: `${SERVER_URL}/api/payment/fail`, // URL for payment failure
      cancel_url: `${SERVER_URL}/api/payment/cancel`, // URL for payment cancellation
      ipn_url: `${SERVER_URL}/api/payment/ipn`, // IPN URL for status updates
      shipping_method: 'NO',
      product_name: tourName,
      product_category: 'Tourism',
      product_profile: 'general',
      cus_name: fullName,
      cus_email: 'customer@example.com', // Placeholder email
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      cus_postcode: '1212',
      cus_country: 'Bangladesh',
      cus_phone: phone,
    };

    const apiResponse = await sslcz.init(sslData); // Initiate SSLCommerz payment
    const GatewayPageURL = apiResponse.GatewayPageURL;

    if (GatewayPageURL) {
      // Payment URL provided, redirect user to gateway
      res.json({ status: 'success', paymentUrl: GatewayPageURL });
    } else {
      throw new Error('Payment initiation failed: No gateway URL');
    }
  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).json({
      success: false,
      message: "Error initiating payment",
      error: error.message,
    });
  }
};

// Handle payment success
const handlePaymentSuccess = async (req, res) => {
  try {
    const { tran_id } = req.body;

    const booking = await Booking.findOne({ transactionId: tran_id });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.status = 'confirmed'; // Update booking status to confirmed
    await booking.save(); // Save the confirmed booking

    res.json({ success: true, message: "Payment successful and booking confirmed" });
  } catch (error) {
    console.error("Error handling payment success:", error);
    res.status(500).json({
      success: false,
      message: "Error handling payment success",
      error: error.message,
    });
  }
};

// Handle payment failure
const handlePaymentFailure = async (req, res) => {
  try {
    const { tran_id } = req.body;

    const booking = await Booking.findOne({ transactionId: tran_id });

    if (booking) {
      booking.status = 'failed'; // Update booking status to failed
      await booking.save();
    }

    res.status(400).json({ success: false, message: "Payment failed" });
  } catch (error) {
    console.error("Error handling payment failure:", error);
    res.status(500).json({
      success: false,
      message: "Error handling payment failure",
      error: error.message,
    });
  }
};

// Handle payment cancellation
const handlePaymentCancel = async (req, res) => {
  try {
    const { tran_id } = req.body;

    const booking = await Booking.findOne({ transactionId: tran_id });

    if (booking) {
      booking.status = 'cancelled'; // Update booking status to cancelled
      await booking.save();
    }

    res.json({ success: true, message: "Payment cancelled and booking updated" });
  } catch (error) {
    console.error("Error handling payment cancel:", error);
    res.status(500).json({
      success: false,
      message: "Error handling payment cancel",
      error: error.message,
    });
  }
};

// Handle IPN (Instant Payment Notification)
const handleIPN = async (req, res) => {
  // Future IPN handling code if needed
};

// Get a single booking by ID
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get bookings by user ID
const getBookingsByUserId = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId });
    if (!bookings || bookings.length === 0) {
      return res.status(404).json({ success: false, message: "No bookings found for this user" });
    }
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a booking
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.json({ success: true, message: "Booking deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  initiatePayment,
  handlePaymentSuccess,
  handlePaymentFailure,
  handlePaymentCancel,
  handleIPN,
  getBooking,
  getAllBookings,
  getBookingsByUserId,  // Export new function
  deleteBooking
};
