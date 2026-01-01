import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import SSLCommerzPayment from 'sslcommerz-lts';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import Booking from './models/Booking.js'; // Ensure Booking model is imported

// Load environment variables
dotenv.config();

const store_id = process.env.SSL_STORE_ID;
const store_passwd = process.env.SSL_STORE_PASSWD;
const is_live = process.env.NODE_ENV === 'production';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3050';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3050;

// MongoDB connection
mongoose.connect(process.env.MONGO_URL || "mongodb+srv://mdshafiuddinshajib_db_user:tWCWL63jCx2XUorK@cluster0.fxfvwbl.mongodb.net/?appName=Cluster0")
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

// CORS setup
app.use(cors({
  origin: [FRONTEND_URL, "http://localhost:5173"],
  credentials: true,
}));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import tourRoutes from './routes/tourRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tour', tourRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/booking', bookingRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to the Trips & Travels API!');
});

// SSLCommerz Payment Routes
app.post('/api/payment/initiate', async (req, res) => {
  const trid = new mongoose.Types.ObjectId().toString();
  const { userId, fullName, tourName, totalPrice, phone, maxGroupSize, date } = req.body;

  // Log the incoming request body
  console.log("Incoming Booking Data:", req.body);

  // Validate required fields
  if (!totalPrice || !fullName || !phone || !tourName) {
    console.error("Validation Error: Missing required fields", { totalPrice, fullName, phone, tourName });
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }

  const data = {
    total_amount: totalPrice,
    currency: 'BDT',
    tran_id: `TRAN_${Date.now()}`,  // Unique transaction ID
    success_url: `${SERVER_URL}/api/payment/success/${trid}`,
    fail_url: `${SERVER_URL}/api/payment/fail`,
    cancel_url: `${SERVER_URL}/api/payment/cancel`,
    ipn_url: `${SERVER_URL}/api/payment/ipn`,
    shipping_method: 'NO',
    product_name: tourName, // Ensure tourName is used here
    product_category: 'Tourism',
    product_profile: 'general',
    cus_name: fullName,
    cus_email: 'customer@example.com',
    cus_add1: 'Dhaka',
    cus_city: 'Dhaka',
    cus_postcode: '1212',
    cus_country: 'Bangladesh',
    cus_phone: phone,
  };

  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

  try {
    // Initiate payment through SSLCommerz
    const apiResponse = await sslcz.init(data);
    const GatewayPageURL = apiResponse.GatewayPageURL;

    if (GatewayPageURL) {
      // Prepare booking data for database
      const bookingData = {
        trsactionid: trid,
        userId: userId || 'Unknown User',
        fullName: fullName,
        tourName: tourName, // Correctly save the tourName in booking data
        totalPrice: totalPrice,
        maxGroupSize: maxGroupSize || 1,
        phone: phone,
        date: date || new Date().toISOString().split('T')[0],
        payment: 'pending' // Payment status is pending until confirmation
      };

      // Insert the booking into the database
      const result = await Booking.create(bookingData);

      // Respond with payment URL after successful database insert
      return res.json({ status: 'success', paymentUrl: GatewayPageURL });
    } else {
      return res.status(400).json({ status: 'failure', message: 'Payment initiation failed: No gateway URL' });
    }
  } catch (error) {
    console.error("Error initiating payment:", error);
    return res.status(500).json({ status: 'error', message: 'Server error during payment initiation', error: error.message });
  }
});

app.post('/api/payment/success/:trid', async (req, res) => {
  const { tran_id, val_id } = req.body; // These are passed by SSLCommerz upon success
  console.log('Payment Success:', req.body);
  const trid = req.params.trid;

  if (!tran_id || !val_id) {
    return res.status(400).json({ status: 'error', message: 'Invalid transaction data' });
  }

  try {
    // Find the booking by transaction ID
    const booking = await Booking.findOne({ trsactionid: trid });

    if (!booking) {
      return res.status(404).json({ status: 'error', message: 'Booking not found for this transaction' });
    }

    // Verify the payment with SSLCommerz API (optional but recommended)
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const validationResponse = await sslcz.validate({ val_id });

    if (validationResponse.status === 'VALID') {
      // Update the booking status to "confirmed" upon successful payment
      booking.payment = 'confirmed';
      await booking.save();

      // Redirect to the success page or return a success message
      res.redirect(`${FRONTEND_URL}/booked?status=success&transactionId=${tran_id}`);
    } else {
      // If the payment validation fails, update status accordingly
      booking.payment = 'failed';
      await booking.save();
      
      return res.status(400).json({ status: 'error', message: 'Payment validation failed' });
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
    res.status(500).json({ status: 'error', message: 'Server error during payment success handling', error: error.message });
  }
});

app.post('/api/payment/fail', (req, res) => {
  const { tran_id } = req.body;
  res.redirect(`${FRONTEND_URL}/booked?status=failure&transactionId=${tran_id}`);
});

app.post('/api/payment/cancel', (req, res) => {
  const { tran_id } = req.body;
  res.redirect(`${FRONTEND_URL}/booked?status=canceled&transactionId=${tran_id}`);
});

app.post('/api/payment/ipn', (req, res) => {
  res.sendStatus(200);
});

// Booking details route
app.get('/api/booking/details', async (req, res) => {
  const { transactionId } = req.query;
  try {
    const bookingDetails = await Booking.findOne({ trsactionid: transactionId });
    if (!bookingDetails) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(bookingDetails);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booking details' });
  }
});

// Add the new route for fetching the latest 5-star reviews
import { getLatestFiveStarReviews } from './controllers/reviewController.js';
app.get('/api/review/latest-five-star', getLatestFiveStarReviews);

// Invoice route to fetch invoice details
app.get('/api/invoice/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the booking details for the invoice
    const booking = await Booking.findOne({ trsactionid: id });

    if (!booking) {
      return res.status(404).json({ status: 'error', message: 'Invoice not found' });
    }

    // Prepare invoice details
    const invoiceDetails = {
      transactionId: booking.trsactionid,
      fullName: booking.fullName,
      tourName: booking.tourName,
      totalPrice: booking.totalPrice,
      date: booking.date,
      paymentStatus: booking.payment,
    };

    res.json({ status: 'success', invoice: invoiceDetails });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch invoice', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).send('Internal Server Error');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
