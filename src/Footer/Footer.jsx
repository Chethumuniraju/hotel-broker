// Footer.jsx
import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section about">
          <h3>Hotel Booker</h3>
          <p>
            Experience the best hotel booking service with us. We ensure the best prices, comfort, and convenience for all our guests.
          </p>
        </div>

        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/main">Home</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/privacy-policy">Privacy Policy</a></li>
          </ul>
        </div>

        <div className="footer-section contact">
          <h3>Contact Us</h3>
          <p>Email: support@hotelbooker.com</p>
          <p>Phone: +1 (234) 567-8901</p>
          <div className="socials">
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer">Facebook</a>
            <a href="https://www.twitter.com" target="_blank" rel="noreferrer">Twitter</a>
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer">Instagram</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Hotel Booker. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
