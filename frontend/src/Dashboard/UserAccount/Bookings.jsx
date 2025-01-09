// File: C:\Trips-Travel-main\frontend\src\Dashboard\UserAccount\Bookings.jsx
import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";
import BASE_URL from "../../utils/config";
import BookingCard from "../../shared/BookingCard";

const Bookings = () => {
  const { user } = useContext(AuthContext);
  const { apiData: bookings } = useFetch(`${BASE_URL}/booking/user/${user._id}`);

  return (
    <div className="py-8">
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-xs md:text-sm border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Tour</th>
              <th className="p-2 border">Persons</th>
              <th className="p-2 border">Booked for</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Actions</th>
              <th className="p-2 border">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {bookings?.length > 0 ? (
              bookings.map((booking) => (
                <BookingCard key={booking._id} booking={booking} />
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Bookings;