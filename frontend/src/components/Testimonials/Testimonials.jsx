import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import BASE_URL from "../../utils/config";

const Testimonials = () => {
  const [testimonialsData, setTestimonialsData] = useState([]);

  useEffect(() => {
    // Fetch latest 5-star reviews
    const fetchTestimonials = async () => {
      try {
        const response = await fetch(`${BASE_URL}/review/latest-five-star`);
        const data = await response.json();

        // Log the response to check if it's coming correctly
        console.log("Fetched testimonials data:", data);

        // Check if the response is successful and data exists
        if (response.ok && data.success && Array.isArray(data.data)) {
          setTestimonialsData(data.data);
        } else {
          console.error(
            "Failed to fetch testimonials or no testimonials available:",
            data.message
          );
        }
      } catch (err) {
        console.error("Error fetching testimonials:", err);
      }
    };

    fetchTestimonials();
  }, []);

  // Settings for the carousel slider
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 1000,
    swipeToSlide: true,
    autoplaySpeed: 3000,
    slidesToShow: 3,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="bg-gray-100 p-8">
      <Slider {...settings}>
        {testimonialsData.length > 0 ? (
          testimonialsData.map((data, index) => (
            <div key={index} className="px-4">
              <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
                <p className="text-gray-600 text-lg mb-4 flex-grow">"{data.reviewText || "No review text available"}"</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white overflow-hidden mr-4">
                      {data.avatar ? (
                        <img
                          src={data.avatar}
                          alt={data.username || "Anonymous"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-lg">U</span> // Placeholder for User icon
                      )}
                    </div>
                    <div>
                      <h5 className="font-bold text-lg">{data.username || "Anonymous"}</h5>
                      <p className="text-sm text-gray-500">September 22, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={i < (data.rating || 5) ? "text-yellow-400" : "text-gray-300"}
                      >
                        ★
                      </span> // Simple star character for ratings
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">No testimonials available at the moment.</div>
        )}
      </Slider>
    </div>
  );
};

export default Testimonials;
