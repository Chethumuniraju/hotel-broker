// Main.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { DateRange } from 'react-date-range';
import { useNavigate } from 'react-router-dom';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './Main.css';

const Main = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [location, setLocation] = useState({ latitude: null, longitude: null });
    const [numRooms, setNumRooms] = useState('');
    const [numPeople, setNumPeople] = useState('');
    const [dateRange, setDateRange] = useState([{ startDate: new Date(), endDate: new Date(), key: 'selection' }]);
    const [hotels, setHotels] = useState([]);
    const [error, setError] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = async (event) => {
        const inputText = event.target.value;
        setQuery(inputText);
        if (inputText.length > 0) {
            try {
                const response = await fetch(
                    `https://api.geoapify.com/v1/geocode/autocomplete?text=${inputText}&format=json&apiKey=65742e5871d448fbb4bc4ebd1e059bb7`
                );
                if (!response.ok) throw new Error('Failed to fetch suggestions.');
                const data = await response.json();
                setSuggestions(data.results || []);
            } catch (error) {
                console.error("Error fetching suggestions:", error);
                setError("Could not fetch suggestions. Please try again.");
                setSuggestions([]);
            }
        } else setSuggestions([]);
    };

    const handleSuggestionClick = (suggestion) => {
        setLocation({ latitude: suggestion.lat, longitude: suggestion.lon });
        setQuery(suggestion.formatted);
        setSuggestions([]);
        setError(null);
    };

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
                    setError(null);
                },
                (error) => {
                    console.error("Error getting current location:", error);
                    setError("Unable to retrieve location. Please check your permissions.");
                }
            );
        } else setError("Geolocation is not supported by your browser.");
    };

    const handleDateRangeChange = (ranges) => setDateRange([ranges.selection]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!location.latitude || !location.longitude) {
            setError("Please select a location first.");
            return;
        }
        const checkInDate = dateRange[0].startDate.toISOString().split('T')[0];
        const checkOutDate = dateRange[0].endDate.toISOString().split('T')[0];
        try {
            const response = await axios.post('http://localhost:3000/closest-hotels', {
                latitude: location.latitude,
                longitude: location.longitude,
                numRooms: parseInt(numRooms),
                capacity: parseInt(numPeople),
                checkInDate,
                checkOutDate,
            });
            if (Array.isArray(response.data.hotels)) {
                setHotels(response.data.hotels);
                setError(null);
            } else setError("No hotels found. Please try again.");
        } catch (error) {
            console.error("Error fetching closest hotels:", error);
            setError("Could not fetch hotels. Please try again later.");
        }
    };

    const handleViewDetails = (hotelId) => navigate(`/customerbooking/${hotelId}`);

    return (
        <div className="container">
            <h1>Find Closest Hotels</h1>
            <div className="input-group">
                <input
                    type="text"
                    placeholder="Type a location"
                    value={query}
                    onChange={handleInputChange}
                />
                <button onClick={handleCurrentLocation}>Use Current Location</button>
                <button onClick={() => setShowCalendar(!showCalendar)}>
                    {showCalendar ? "Hide Calendar" : "Select Dates"}
                </button>
            </div>
            {showCalendar && (
                <DateRange
                    ranges={dateRange}
                    onChange={handleDateRangeChange}
                    minDate={new Date()}
                    rangeColors={["#3d91ff"]}
                />
            )}
            {suggestions.length > 0 && (
                <ul>
                    {suggestions.map((suggestion) => (
                        <li
                            key={suggestion.place_id}
                            onClick={() => handleSuggestionClick(suggestion)}
                            style={{ cursor: 'pointer', padding: '5px 0' }}
                        >
                            {suggestion.formatted}
                        </li>
                    ))}
                </ul>
            )}
            <form className="input-group" onSubmit={handleSubmit}>
                <input
                    type="number"
                    placeholder="Number of rooms"
                    value={numRooms}
                    onChange={(e) => setNumRooms(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Number of people"
                    value={numPeople}
                    onChange={(e) => setNumPeople(e.target.value)}
                    required
                />
                <button type="submit">Find Closest Hotels</button>
            </form>
            {hotels.length > 0 && (
                <div>
                    <h2>Top 20 Closest Hotels</h2>
                    <div className="hotel-list">
                        {hotels.map((hotel) => (
                            <div className="hotel-card" key={hotel.hotel_id}>
                                <div className="hotel-images">
                                    {hotel.images && hotel.images.length > 0 ? (
                                        hotel.images.map((image, index) => (
                                            <img key={index} src={image} alt={hotel.name} className="hotel-image" />
                                        ))
                                    ) : (
                                        <img src="placeholder_image_url" alt="No image available" className="hotel-image" />
                                    )}
                                </div>
                                <div className="hotel-details">
                                    <h3>{hotel.name}</h3>
                                    <p>{hotel.address}, {hotel.city}, {hotel.state}</p>
                                    <p>{hotel.distance.toFixed(2)} km away</p>
                                    <p>Rating: {hotel.rating_avg} ⭐</p>
                                    <p>Price: ₹{hotel.low_price} to ₹{hotel.high_price} per night</p>
                                    <div className="hotel-facilities">
                                        {hotel.amenities && hotel.amenities.map((facility, index) => (
                                            <span key={index} className="facility">{facility}</span>
                                        ))}
                                    </div>
                                    <button onClick={() => handleViewDetails(hotel.hotel_id)}>View Details</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        </div>
    );
};

export default Main;
