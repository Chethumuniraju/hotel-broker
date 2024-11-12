// Header.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header style={styles.header}>
      <button style={styles.buttonLeft} onClick={() => navigate('/main')}>
        Home
      </button>
      <h1 style={styles.title}>Hotel Booker</h1>
      <button style={styles.buttonRight} onClick={() => navigate('/mybookings')}>
        My Bookings
      </button>
    </header>
  );
};

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    padding: '10px 20px',
    color: '#fff',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  buttonLeft: {
    marginRight: 'auto',
    backgroundColor: '#555',
    color: '#fff',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  buttonRight: {
    marginLeft: 'auto',
    backgroundColor: '#555',
    color: '#fff',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Header;
