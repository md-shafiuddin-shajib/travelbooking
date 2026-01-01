import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import SSLCommerzPayment from "sslcommerz-lts";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";

import Booking from "./models/Booking.js";

// Load env (safe in local, harmless in production)
dotenv.config();

/* ================= ENV VARIABLES ================= */
const {
  MONGO_URL,
  FRONTEND_URL,
  SERVER_URL,
  SSL_STORE_ID,
  SSL_STORE_PASSWD,
  NODE_ENV,
} = process.env;

const PORT = process.env.PORT || 3050;
const is_live = NODE_ENV === "production";

/* ================= APP SETUP ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

/* ================= DATABASE ================= */
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

/* ================= CORS ================= */
const allowedOrigins = [
  FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* ================= ROUTES ================= */
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import tourRoutes from "./routes/tourRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/tour", tourRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/booking", bookingRoutes);

/* ================= ROOT ================= */
app.get("/", (req, res) => {
  res.send("Welcome to the Trips & Travels API!");
});

/* ================= PAYMENT INIT ================= */
app.post("/api/payment/initiate", async (req, res) => {
  const trid = new mongoose.Types.ObjectId().toString();

  const {
    userId,
    fullName,
    tourName,
    totalPrice,
    phone,
    maxGroupSize,
    date,
  } = req.body;

  if (!totalPrice || !fullName || !phone || !tourName) {
    return res
      .status(400)
      .json({ status: "error", message: "Missing required fields" });
  }

  const data = {
    total_amount: totalPrice,
    currency: "BDT",
    tran_id: `TRAN_${Date.now()}`,
    success_url: `${SERVER_URL}/api/payment/success/${trid}`,
    fail_url: `${SERVER_URL}/api/payment/fail`,
    cancel_url: `${SERVER_URL}/api/payment/cancel`,
    ipn_url: `${SERVER_URL}/api/payment/ipn`,
    shipping_method: "NO",
    product_name: tourName,
    product_category: "Tourism",
    product_profile: "general",
    cus_name: fullName,
    cus_email: "customer@example.com",
    cus_add1: "Dhaka",
    cus_city: "Dhaka",
    cus_postcode: "1212",
    cus_country: "Bangladesh",
    cus_phone: phone,
  };

  const sslcz = new SSLCommerzPayment(
    SSL_STORE_ID,
    SSL_STORE_PASSWD,
    is_live
  );

  try {
    const apiResponse = await sslcz.init(data);
    const GatewayPageURL = apiResponse.GatewayPageURL;

    if (!GatewayPageURL) {
      return res
        .status(400)
        .json({ status: "failure", message: "Payment gateway error" });
    }

    await Booking.create({
      trsactionid: trid,
      userId: userId || "Unknown User",
      fullName,
      tourName,
      totalPrice,
      maxGroupSize: maxGroupSize || 1,
      phone,
      date: date || new Date().toISOString().split("T")[0],
      payment: "pending",
    });

    res.json({ status: "success", paymentUrl: GatewayPageURL });
  } catch (error) {
    console.error("Payment initiation error:", error);
    res
      .status(500)
      .json({ status: "error", message: "Payment initiation failed" });
  }
});

/* ================= PAYMENT SUCCESS ================= */
app.post("/api/payment/success/:trid", async (req, res) => {
  const { val_id } = req.body;
  const { trid } = req.params;

  if (!val_id) {
    return res.status(400).json({ status: "error", message: "Invalid data" });
  }

  try {
    const booking = await Booking.findOne({ trsactionid: trid });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const sslcz = new SSLCommerzPayment(
      SSL_STORE_ID,
      SSL_STORE_PASSWD,
      is_live
    );
    const validation = await sslcz.validate({ val_id });

    if (validation.status === "VALID") {
      booking.payment = "confirmed";
      await booking.save();
      res.redirect(
        `${FRONTEND_URL}/booked?status=success&transactionId=${trid}`
      );
    } else {
      booking.payment = "failed";
      await booking.save();
      res.redirect(
        `${FRONTEND_URL}/booked?status=failure&transactionId=${trid}`
      );
    }
  } catch (error) {
    console.error("Payment success error:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
});

/* ================= PAYMENT FAIL / CANCEL / IPN ================= */
app.post("/api/payment/fail", (req, res) => {
  res.redirect(`${FRONTEND_URL}/booked?status=failure`);
});

app.post("/api/payment/cancel", (req, res) => {
  res.redirect(`${FRONTEND_URL}/booked?status=canceled`);
});

app.post("/api/payment/ipn", (req, res) => {
  res.sendStatus(200);
});

/* ================= EXTRA ROUTES ================= */
import { getLatestFiveStarReviews } from "./controllers/reviewController.js";
app.get("/api/review/latest-five-star", getLatestFiveStarReviews);

app.get("/api/booking/details", async (req, res) => {
  const { transactionId } = req.query;
  const booking = await Booking.findOne({ trsactionid: transactionId });
  if (!booking) return res.status(404).json({ message: "Booking not found" });
  res.json(booking);
});

app.get("/api/invoice/:id", async (req, res) => {
  const booking = await Booking.findOne({ trsactionid: req.params.id });
  if (!booking) return res.status(404).json({ message: "Invoice not found" });

  res.json({
    transactionId: booking.trsactionid,
    fullName: booking.fullName,
    tourName: booking.tourName,
    totalPrice: booking.totalPrice,
    date: booking.date,
    paymentStatus: booking.payment,
  });
});

/* ================= ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).send("Internal Server Error");
});

/* ================= START SERVER ================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
