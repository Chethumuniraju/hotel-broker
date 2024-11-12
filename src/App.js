// App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/home/Home';
import Login from './components/login/Login';
import Signup from './components/signup/Signup';
import Main from './components/main/Main';
import Booking from './customerbooking/customerbooking';
import Payments from './payments/Payment';
import MyBooking from './MyBookings/mybookings';



function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/customerbooking/:hotelId" element={<Booking />} />
      <Route path="/payments" element={<Payments/>} />
      <Route path="/mybookings" element={<MyBooking />} />
      <Route path="/main" element={
       
          <Main />
       
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
