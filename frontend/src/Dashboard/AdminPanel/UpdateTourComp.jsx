import React, { useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../utils/config";
import { AuthContext } from "../../context/AuthContext";

const UpdateTours = ({ tour, id }) => {
  const { token } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    city: "",
    desc: "",
    address: "",
    price: 0,
    maxGroupSize: 1,
    photo: "",
    distance: 0,
    featured: false,
  });

  useEffect(() => {
    if (tour) {
      const {
        title,
        city,
        desc,
        address,
        price,
        maxGroupSize,
        photo,
        distance,
        featured,
      } = tour || {};

      setFormData((prevData) => ({
        ...prevData,
        title: title || "",
        city: city || "",
        desc: desc || "",
        address: address || "",
        price: price || 0,
        maxGroupSize: maxGroupSize || 1,
        photo: photo || "",
        distance: distance || 0,
        featured: featured || false,
      }));
    }
  }, [tour]);

  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/tour/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const { message } = await response.json();

      if (response.ok) {
        toast.success(message);
      } else {
        toast.error(message);
      }
    } catch (err) {
      toast.error("Server not responding");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen md:min-h-[400px] flex items-center justify-center bg-gray-100">
      <div className="bg-white mx-6 p-6 md:p-8 rounded-lg text-center shadow-md w-full max-w-2xl m-8 md:max-w-[90%] ">
        <div className="flex flex-col justify-center">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              Update Tour
            </h2>
            <p className="text-sm md:text-base text-GrayColor">
              Update the tour by filling in all fields.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2 md:space-y-3">
            <div className="md:grid grid-cols-2 gap-8">
              <div>
                <label htmlFor="title" className="block text-md md:text-lg font-medium text-GrayColor">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Enter Tour Name"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-GreenColor"
                  value={formData.title}
                  onChange={handleInput}
                  required
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-md md:text-lg font-medium text-GrayColor">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  placeholder="Enter City Name"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-GreenColor"
                  value={formData.city}
                  onChange={handleInput}
                  required
                />
              </div>
            </div>
            <div className="md:grid grid-cols-3 gap-8">
              <div>
                <label htmlFor="price" className="block text-md md:text-lg font-medium text-GrayColor">
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="Enter Price"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-GreenColor"
                  value={formData.price}
                  onChange={handleInput}
                  required
                />
              </div>

              <div>
                <label htmlFor="maxGroupSize" className="block text-md md:text-lg font-medium text-GrayColor">
                  Max People
                </label>
                <input
                  type="number"
                  id="maxGroupSize"
                  name="maxGroupSize"
                  placeholder="Enter Max People per Trip Tour"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-GreenColor"
                  value={formData.maxGroupSize}
                  onChange={handleInput}
                  required
                />
              </div>

              <div>
                <label htmlFor="distance" className="block text-md md:text-lg font-medium text-GrayColor">
                  Distance
                </label>
                <input
                  type="number"
                  id="distance"
                  name="distance"
                  placeholder="Enter Total Distance"
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-GreenColor"
                  value={formData.distance}
                  onChange={handleInput}
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-md md:text-lg font-medium text-GrayColor">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Enter Destination Address"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-GreenColor"
                value={formData.address}
                onChange={handleInput}
                required
              />
            </div>

            <div>
              <label htmlFor="desc" className="block text-md md:text-lg font-medium text-GrayColor">
                Description
              </label>
              <textarea
                id="desc"
                name="desc"
                placeholder="Enter Description"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-GreenColor"
                value={formData.desc}
                onChange={handleInput}
              />
            </div>

            <div>
              <label htmlFor="photo" className="block text-md md:text-lg font-medium text-GrayColor">
                Photo URL
              </label>
              <input
                type="text"
                id="photo"
                name="photo"
                placeholder="Enter Picture URL"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-GreenColor"
                value={formData.photo}
                onChange={handleInput}
                required
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full Bluebtn my-3"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateTours;