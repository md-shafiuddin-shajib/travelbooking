// File: C:\Trips-Travel-main\frontend\src\shared\Invoice.jsx
import React from 'react';
import { Download } from 'lucide-react';
import { jsPDF } from "jspdf";

const Invoice = ({ booking }) => {
  const { tourName, totalPrice, maxGroupSize, date, _id, status } = booking;

  const downloadInvoice = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Invoice", 105, 20, null, null, "center");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Tour: ${tourName}`, 20, 40);
    doc.text(`Booking ID: ${_id}`, 20, 50);
    doc.text(`Date: ${new Date(date).toLocaleDateString()}`, 20, 60);
    doc.text(`Group Size: ${maxGroupSize}`, 20, 70);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Price: BDT${totalPrice.toFixed(2)}`, 20, 90);
    doc.save("invoice.pdf");
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Invoice</h2>
        <p className="text-xs text-gray-600">for {tourName}</p>
      </div>
      <div className="p-4">
        {/* Booking ID section on a separate line */}
        <div className="mb-4">
          <p className="font-medium text-gray-600">Booking ID</p>
          <p className="text-gray-800">{_id}</p>
        </div>
        {/* Other details in grid */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="font-medium text-gray-600">Date</p>
            <p className="text-gray-800">{new Date(date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="font-medium text-gray-600">Group Size</p>
            <p className="text-gray-800">{maxGroupSize}</p>
          </div>
        </div>
        <div className="mt-4 border-t border-gray-200 pt-2">
          <div className="flex justify-between items-center">
            <p className="text-base font-semibold text-gray-800">Total Price</p>
            <p className="text-lg font-bold text-green-600">৳{totalPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-2">
        <button
          onClick={downloadInvoice}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-sm transition duration-300 ease-in-out flex items-center justify-center"
        >
          <Download className="mr-1" size={16} />
          Download Invoice
        </button>
      </div>
    </div>
  );
  
};

export default Invoice;