import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { FaPeopleGroup, FaLocationDot, FaStar, FaMapPin, FaCity, FaDollarSign } from "react-icons/fa6";
import { AuthContext } from "../context/AuthContext";
import useFetch from "../hooks/useFetch";
import BASE_URL from "../utils/config";
import CalculateAvg from "../utils/CalculateAvg";
import Booking from "../components/Booking/Booking";
import { toast } from "react-toastify";

const TourDetails = () => {
  const { user } = useContext(AuthContext);
  const reviewMsgRef = useRef();
  const [tourRating, setTourRating] = useState(0);
  const { id } = useParams();

  const { apiData: tour, error } = useFetch(`${BASE_URL}/tour/${id}`, {
    method: "GET",
  });

  const {
    title = "",
    photo = "",
    desc = "",
    price = "",
    reviews = "",
    city = "",
    distance = "",
    maxGroupSize = "",
    address = "",
  } = tour || {};

  const reviewsArray = Array.isArray(reviews) ? reviews : [];
  const { totalRating, avgRating } = CalculateAvg(reviewsArray);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const reviewText = reviewMsgRef.current.value;

    if (!user) {
      toast.error("Please Sign In first");
      return;
    }

    if (!tourRating) {
      toast.error("Please select a rating");
      return;
    }

    try {
      const reviewData = {
        username: user.username,
        reviewText,
        rating: tourRating,
      };
      const response = await fetch(`${BASE_URL}/review/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });
      const result = await response.json();
      if (response.ok) {
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Server not responding");
      console.error(err);
    }
  };

  const formatDescription = (desc) => {
    const lines = desc.split('\n').filter(line => line.trim() !== '');
    
    return lines.map((line, index) => {
      if (line.trim().match(/^[-•*]|\d+\./)) {
        return <li key={index} className="ml-6 list-disc">{line.trim()}</li>;
      }
      return <p key={index} className="mb-2">{line}</p>;
    });
  };

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  if (!tour) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <img src={photo} alt={title} className="w-full h-[400px] object-cover rounded-lg shadow-lg mb-8" />
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h1 className="text-3xl font-bold mb-4">{title}</h1>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <InfoItem icon={<FaStar />} text={`${avgRating} (${reviewsArray.length} reviews)`} />
              <InfoItem icon={<FaMapPin />} text={address} />
              <InfoItem icon={<FaCity />} text={city} />
              <InfoItem icon={<FaLocationDot />} text={distance} />
              <InfoItem icon={<FaDollarSign />} text={`${price}/per head`} />
              <InfoItem icon={<FaPeopleGroup />} text={`Max group: ${maxGroupSize}`} />
            </div>
            
            <h2 className="text-2xl font-semibold mb-2">Description</h2>
            <div className="text-gray-700 mb-6">
              {formatDescription(desc)}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Reviews ({reviewsArray.length})</h2>
            
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="flex mb-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star
                    key={rating}
                    filled={rating <= tourRating}
                    onClick={() => setTourRating(rating)}
                  />
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  ref={reviewMsgRef}
                  placeholder="Share your thoughts"
                  className="flex-grow border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-r-lg hover:bg-blue-600 transition duration-300"
                >
                  Submit
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {reviewsArray.map((review) => (
                <ReviewItem key={review._id} review={review} />
              ))}
            </div>
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="sticky top-8">
            <Booking
              title={title}
              price={price}
              avgRating={avgRating}
              reviewsArray={reviewsArray}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, text }) => (
  <div className="flex items-center space-x-2">
    <span className="text-blue-500">{icon}</span>
    <span className="text-gray-700">{text}</span>
  </div>
);

const Star = ({ filled, onClick }) => (
  <FaStar
    className={`cursor-pointer ${
      filled ? "text-yellow-400" : "text-gray-300"
    } hover:text-yellow-400 transition duration-150`}
    onClick={onClick}
  />
);

const ReviewItem = ({ review }) => (
  <div className="border-b pb-4">
    <div className="flex items-center justify-between mb-2">
      <div>
        <h3 className="font-semibold">{review.username}</h3>
        <p className="text-sm text-gray-500">
          {new Date(review.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
      <div className="flex items-center">
        <span className="mr-1">{review.rating}</span>
        <FaStar className="text-yellow-400" />
      </div>
    </div>
    <p className="text-gray-700">{review.reviewText}</p>
  </div>
);

export default TourDetails;