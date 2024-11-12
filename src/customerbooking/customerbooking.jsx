import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Booking.css'; // Import the CSS file

const Booking = () => {
    const { hotelId } = useParams();
    const navigate = useNavigate();
    const [roomsByType, setRoomsByType] = useState({});
    const [selectedRooms, setSelectedRooms] = useState([]);
    const [totalCapacity, setTotalCapacity] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/available-rooms/${hotelId}`);
                const rooms = response.data.rooms;
                const roomsGrouped = rooms.reduce((acc, room) => {
                    if (!acc[room.room_type]) {
                        acc[room.room_type] = [];
                    }
                    acc[room.room_type].push(room);
                    return acc;
                }, {});
                setRoomsByType(roomsGrouped);
            } catch (error) {
                console.error('Error fetching rooms:', error);
            }
        };

        if (hotelId) fetchRooms();
    }, [hotelId]);

    const handleRoomSelect = (room) => {
        const isSelected = selectedRooms.some(selected => selected.room_id === room.room_id);

        if (isSelected) {
            setSelectedRooms(selectedRooms.filter(selected => selected.room_id !== room.room_id));
            setTotalCapacity(totalCapacity - room.capacity);
            setTotalPrice(totalPrice - parseFloat(room.price_per_night));
        } else {
            setSelectedRooms([...selectedRooms, room]);
            setTotalCapacity(totalCapacity + room.capacity);
            setTotalPrice(totalPrice + parseFloat(room.price_per_night));
        }
    };

    const handleProceedToPayment = () => {
        const selectedRoomIds = selectedRooms.map(room => room.room_id);
        const paymentData = {
            roomIds: selectedRoomIds,
            totalAmount: totalPrice
        };

        localStorage.setItem('paymentData', JSON.stringify(paymentData));

        navigate('/payments');
    };

    return (
        <div className="booking-container">
            <h2>Available Rooms for Hotel ID: {hotelId}</h2>
            <div>
                {Object.keys(roomsByType).map((roomType) => (
                    <div key={roomType} className="room-type">
                        <h3>{roomType}</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {roomsByType[roomType].map(room => (
                                <div
                                    key={room.room_id}
                                    onClick={() => handleRoomSelect(room)}
                                    className={`room-box ${selectedRooms.some(selected => selected.room_id === room.room_id) ? 'selected' : ''}`}
                                >
                                    Room No: {room.room_no} <br />
                                    Price: ₹{parseFloat(room.price_per_night).toFixed(2)}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="summary-section">
                <h3>Total Summary</h3>
                <div className="summary-details">
                    <p>Total Capacity: {totalCapacity}</p>
                    <p>Total Price: ₹{totalPrice.toFixed(2)}</p>
                </div>
                <button 
                    className="proceed-button" 
                    onClick={handleProceedToPayment} 
                    disabled={selectedRooms.length === 0}
                >
                    Proceed to Payment
                </button>
            </div>
        </div>
    );
};

export default Booking;
