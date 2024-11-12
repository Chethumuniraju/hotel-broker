import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MyBooking.css';

const MyBooking = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem('user_id'); // Fetch user_id from localStorage
    if (userId) {
      axios
        .get('http://localhost:3000/api/mybookings', {
          params: { user_id: userId },
        })
        .then((response) => {
          setBookings(response.data);
        })
        .catch((error) => {
          console.error('Error fetching bookings:', error);
        });
    }
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="my-booking-container">
      <h2>My Bookings</h2>
      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <div key={booking.booking_id} className="my-booking-card">
            
            <p><strong>Check-In Date:</strong> {formatDate(booking.check_in_date)}</p>
            <p><strong>Check-Out Date:</strong> {formatDate(booking.check_out_date)}</p>
            <p><strong>Total Price:</strong> ${booking.total_price}</p>
       
           
          </div>
        ))
      ) : (
        <p>No bookings found.</p>
      )}
    </div>
  );
};

export default MyBooking;
