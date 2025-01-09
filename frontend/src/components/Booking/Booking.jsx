import React, { useState, useContext, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:3050/api"; // Update this with actual API base URL

const Booking = ({ price, title, reviewsArray, avgRating, isCourse = false }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [currentDate, setCurrentDate] = useState('');
  const [data, setData] = useState({
    userId: user?._id || "",
    tourName: title, // Keep the tourName from props
    fullName: "",
    totalPrice: price,
    phone: "",
    maxGroupSize: 1,
    babyCount: 0,
    bookAt: "",
    date: "",
    payment: "pending"
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setCurrentDate(formattedDate); //today

    // Set initial data with today’s date
    setData((prevData) => ({
      ...prevData,
      bookAt: formattedDate, //today
      date: formattedDate, //today
    }));
  }, []);

  const calculatePrice = () => {
    const adultPrice = data.maxGroupSize * price;
    const babyPrice = data.babyCount * price * 0.2;
    return adultPrice + babyPrice;
  };

  const calculatedPrice = calculatePrice();

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === "fullName") {
      setData((prevData) => ({ ...prevData, [id]: value }));
    } else if (id === "phone") {
      const phoneRegex = /^[0-9\b]+$/;
      if (value === "" || phoneRegex.test(value)) {
        setData((prevData) => ({ ...prevData, [id]: value }));
      }
    } else {
      setData((prevData) => ({
        ...prevData,
        [id]: parseInt(value, 10) || 0,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in first");
      return;
    }

    if (data.maxGroupSize <= 0) {
      toast.error("Number of persons must be at least 1.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Initiate payment
      const paymentResponse = await fetch(`${BASE_URL}/payment/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          totalPrice: calculatedPrice,
          date: currentDate,
        }),
      });

      const paymentResult = await paymentResponse.json();

      if (paymentResponse.ok && paymentResult.paymentUrl) {
        // Redirect to payment URL
        window.location.href = paymentResult.paymentUrl;
      } else {
        // Log the error message for debugging
        console.error("Payment initiation failed:", paymentResult);
        throw new Error(paymentResult.message || "Payment initialization failed.");
      }

    } catch (error) {
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
      
      // Reset form fields but keep userId, tourName intact
      setData((prevData) => ({
        ...prevData,
        fullName: "",
        phone: "",
        maxGroupSize: 1,
        babyCount: 0,
        // Ensure tourName is retained to avoid missing value
        tourName: title, // Retain the tourName
        bookAt: currentDate, // Resetting bookAt and date might help
        date: currentDate,
      }));
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-blue-600 text-white py-4 px-6">
        <h2 className="text-2xl font-bold text-center">Book the Tour</h2>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            ৳{price} <span className="text-base font-normal text-gray-600">/person</span>
          </h3>
          <div className="flex items-center">
            <FaStar className="text-yellow-400 mr-1" />
            <span className="font-semibold">{avgRating}</span>
            <span className="text-gray-600 ml-1">({reviewsArray.length})</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              id="fullName"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              value={data.fullName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              id="phone"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              value={data.phone}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="maxGroupSize" className="block text-sm font-medium text-gray-700 mb-1">Number of Persons</label>
            <input
              type="number"
              id="maxGroupSize"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="1"
              value={data.maxGroupSize}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="babyCount" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Babies {isCourse && "(Under 6)"}
            </label>
            <input
              type="number"
              id="babyCount"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              value={data.babyCount}
              onChange={handleChange}
            />
            <p className="text-sm text-gray-500 mt-1">Babies get an 80% discount.</p>
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Booking Date (Today)</label>
            <input
              type="date"
              id="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
              required
              value={currentDate}
              //value={data.date}
              //onChange={(e) => setData({ ...data, date: e.target.value })}
              readOnly
            />
          </div>

          <div className="mt-6 bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Price per person</span>
              <span className="font-semibold">৳{price}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Adults ({data.maxGroupSize})</span>
              <span className="font-semibold">৳{data.maxGroupSize * price}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Babies ({data.babyCount})</span>
              <span className="font-semibold">
                ৳{data.babyCount * price * 0.2} (80% off)
              </span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Price</span>
              <span>৳{calculatedPrice}</span>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 mt-4"
            disabled={loading}
          >
            {loading ? "Processing..." : "Book Now"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Booking;
