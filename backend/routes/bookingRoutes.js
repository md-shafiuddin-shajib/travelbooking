import express from 'express';
import {
  initiatePayment,
  handlePaymentSuccess,
  handlePaymentFailure,
  handlePaymentCancel,
  handleIPN,
  getBooking,
  getAllBookings,
  getBookingsByUserId,  // Add this new import
  deleteBooking
} from '../controllers/bookingController.js';

const router = express.Router();

// Payment routes
router.post('/initiate', initiatePayment);
router.post('/success', handlePaymentSuccess);
router.post('/fail', handlePaymentFailure);
router.post('/cancel', handlePaymentCancel);
router.post('/ipn', handleIPN);

// Booking routes
router.get('/', getAllBookings);
router.get('/:id', getBooking);
router.get('/user/:userId', getBookingsByUserId);  // Add a new route for fetching bookings by userId
router.delete('/:id', deleteBooking);

export default router;
