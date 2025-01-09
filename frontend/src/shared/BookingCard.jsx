import React, { useState } from "react";
import { toast } from "react-toastify";
import { AlertTriangle, CreditCard } from 'lucide-react';
import BASE_URL from "../utils/config";
import Invoice from "./Invoice";

const BookingCard = ({ booking }) => {
  const { tourName, totalPrice, maxGroupSize, date, _id, payment } = booking;
  const [showInvoice, setShowInvoice] = useState(false);

  const bookingDate = new Date(date);
  const currentDate = new Date();
  const timeDifference = (currentDate - bookingDate) / (1000 * 60 * 60);
  const canCancel = timeDifference < 48 && payment === "confirmed";

  const confirmDelete = async () => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      deleteBooking();
    }
  };

  const deleteBooking = async () => {
    try {
      const response = await fetch(`${BASE_URL}/booking/${_id}`, {
        method: "DELETE",
      });
      const { message } = await response.json();

      if (response.ok) {
        location.reload();
      } else {
        toast.error(message);
      }
    } catch (err) {
      toast.error("Server not responding");
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-2 border">
        <div className="font-semibold">{tourName}</div>
      </td>
      <td className="p-2 border">{maxGroupSize}</td>
      <td className="p-2 border">{new Date(date).toLocaleDateString()}</td>
      <td className="p-2 border">৳{totalPrice.toFixed(2)}</td>
      <td className="p-2 border">
        {payment === "confirmed" ? (
          canCancel ? (
            <button
              onClick={confirmDelete}
              className="bg-red-500 text-white p-1 px-2 rounded hover:bg-red-600 transition duration-300 text-xs"
            >
              Cancel Booking
            </button>
          ) : (
            <span className="text-red-500 flex items-center">
              <AlertTriangle size={16} className="mr-1" />
              <span className="text-xs">Cancel Not Available</span>
            </span>
          )
        ) : (
          <span className="text-yellow-500 flex items-center">
            <CreditCard size={16} className="mr-1" />
            <span className="text-xs">Payment Not Confirmed</span>
          </span>
        )}
      </td>
      <td className="p-2 border">
        {canCancel && (
          <>
            <button
              onClick={() => setShowInvoice(!showInvoice)}
              className="bg-blue-500 text-white p-1 px-2 rounded hover:bg-blue-600 transition duration-300 text-xs"
            >
              {showInvoice ? "Hide Invoice" : "Show Invoice"}
            </button>
            {showInvoice && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg overflow-hidden" style={{zIndex: 10, width: '300px'}}>
                <Invoice booking={booking} />
              </div>
            )}
          </>
        )}
      </td>
    </tr>
  );
};

export default BookingCard;