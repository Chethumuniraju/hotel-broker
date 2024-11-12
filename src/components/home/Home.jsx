// Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to Our Application</h1>
      <p style={styles.description}>
        Experience the best services by signing up or logging in. Join our community today!
      </p>
      <div style={styles.buttonContainer}>
        <button 
          onClick={() => navigate('/login')} 
          style={styles.button}
          aria-label="Navigate to Login Page"
        >
          Login
        </button>
        <button 
          onClick={() => navigate('/signup')} 
          style={styles.button}
          aria-label="Navigate to Signup Page"
        >
          Signup
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '50px',
  },
  title: {
    fontSize: '2.5em',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  description: {
    fontSize: '1.2em',
    marginBottom: '30px',
    color: '#666',
  },
  buttonContainer: {
    display: 'flex',
    gap: '20px',
  },
  button: {
    margin: '10px',
    padding: '12px 25px',
    fontSize: '1em',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  buttonHover: {
    backgroundColor: '#45a049',
  },
};

export default Home;
