import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import axios from 'axios';
import './payment.css'; // Import the CSS file

const Payments = () => {
    const navigate = useNavigate();
    
    // Set default dates
    const today = dayjs().format('YYYY-MM-DD');
    const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');

    const [checkInDate, setCheckInDate] = useState(today);
    const [checkOutDate, setCheckOutDate] = useState(tomorrow);
    const [numOfNights, setNumOfNights] = useState(1);
    const [finalPrice, setFinalPrice] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [selectedRoomIds, setSelectedRoomIds] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('');

    useEffect(() => {
        const paymentData = JSON.parse(localStorage.getItem('paymentData'));
        if (paymentData) {
            setSelectedRoomIds(paymentData.roomIds);
            const pricePerNight = paymentData.totalAmount;
            setTotalPrice(pricePerNight);
            setFinalPrice(pricePerNight); // Set initial final price based on one night
        }
    }, []);

    const handleCheckInChange = (e) => {
        setCheckInDate(e.target.value);
    };

    const handleCheckOutChange = (e) => {
        setCheckOutDate(e.target.value);
    };

    const handleUpdatePrice = () => {
        if (checkInDate && checkOutDate) {
            const checkInDayjs = dayjs(checkInDate);
            const checkOutDayjs = dayjs(checkOutDate);
            const nights = checkOutDayjs.diff(checkInDayjs, 'day');

            if (nights < 0) {
                alert('Check-out date must be after check-in date.');
                return;
            }
            setNumOfNights(nights > 0 ? nights : 1); // Default to 1 if no nights selected
            setFinalPrice(totalPrice * (nights > 0 ? nights : 1));
        } else {
            alert('Please select both check-in and check-out dates.');
        }
    };

    const handleProceedToPayment = async () => {
        const way = paymentMethod === 'card' ? 'card' : 'cash';
        const status = paymentMethod === 'card' ? 'completed' : 'pending';

        const userData = JSON.parse(localStorage.getItem('user_id')); // Retrieve user data
        if (!userData ) {
            console.error("User is not logged in or user data is not available.");
            alert("You need to log in to proceed with the payment.");
            return; // Exit the function if user data is not available
        }
        
        const userId = userData; // Use the retrieved user ID

        try {
            // Send a single request to create the payment and booking
            const response = await axios.post('http://localhost:3000/api/complete-payment', {
                user_id: userId,
                check_in_date: checkInDate,
                check_out_date: checkOutDate,
                total_price: finalPrice,
                payment_method: way,
                payment_status: status,
                room_ids: selectedRoomIds,
            });

            // If the response contains necessary data, navigate to confirmation page
            if (response.data.success) {
                navigate('/mybookings'); // Adjust the route as necessary
            } else {
                alert('There was an error processing your payment. Please try again.');
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('There was an error processing your payment. Please try again.');
        }
    };

    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    return (
        <div className="payment-container">
            <h2>Payment Details</h2>
            <div>
                <label>
                    Check-in Date:
                    <input type="date" value={checkInDate} onChange={handleCheckInChange} />
                </label>
            </div>
            <div>
                <label>
                    Check-out Date:
                    <input type="date" value={checkOutDate} onChange={handleCheckOutChange} />
                </label>
            </div>
            <button onClick={handleUpdatePrice}>
                Update Price
            </button>
            <div className="price-summary">
                <p>Number of Nights: {numOfNights}</p>
                <p>Price Per Night: ₹{totalPrice.toFixed(2)}</p>
                <p>Total Price: ₹{finalPrice.toFixed(2)}</p>
            </div>
            <div className="selected-rooms">
                <h3>Selected Rooms:</h3>
                <ul>
                    {selectedRoomIds.map((roomId, index) => (
                        <li key={index}>Room ID: {roomId}</li>
                    ))}
                </ul>
            </div>

            <div className="payment-methods">
                <h3>Select Payment Method:</h3>
                <label>
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={handlePaymentMethodChange}
                    />
                    Credit/Debit Card
                </label>
                <label>
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={handlePaymentMethodChange}
                    />
                    Cash on Arrival
                </label>
            </div>
            <button onClick={handleProceedToPayment} disabled={numOfNights <= 0 || !paymentMethod}>
                Submit Payment
            </button>
        </div>
    );
};

export default Payments;
