import React, { useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const Booked = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const paymentStatus = queryParams.get('status');

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  const getStatusContent = () => {
    switch (paymentStatus) {
      case 'success':
        return {
          icon: <FaCheckCircle size={45} className="text-green-500" />,
          title: 'Congratulations!',
          message: 'Your Tour has been booked!',
          buttonText: 'Check Bookings',
          buttonLink: '/my-account'
        };
      case 'failure':
        return {
          icon: <FaTimesCircle size={45} className="text-red-500" />,
          title: 'Oops, something went wrong.',
          message: 'Your payment has failed.',
          buttonText: 'Try Again',
          buttonLink: '/'
        };
      case 'canceled':
        return {
          icon: <FaTimesCircle size={45} className="text-yellow-500" />,
          title: 'Payment Canceled',
          message: 'Your payment process was canceled.',
          buttonText: 'Back to Home',
          buttonLink: '/'
        };
      default:
        return {
          icon: <FaTimesCircle size={45} className="text-gray-500" />,
          title: 'Unknown Status',
          message: 'We couldn\'t determine the payment status.',
          buttonText: 'Back to Home',
          buttonLink: '/'
        };
    }
  };

  const { icon, title, message, buttonText, buttonLink } = getStatusContent();

  return (
    <div className="flex items-center flex-col justify-center min-h-[500px]">
      {icon}
      <h2 className="text-[25px] md:text-[40px] font-bold mb-4 text-center">
        {title}
      </h2>
      <h5 className="font-semibold text-[16px] md:text-[20px] pb-9 text-center">
        {message}
      </h5>
      <Link className="btn" to={buttonLink}>
        {buttonText}
      </Link>
    </div>
  );
};

export default Booked;