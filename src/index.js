import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import App from './App';
import Header from './header/header';
import Footer from './Footer/Footer';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter> 
    <Header/>
      <App />
      <Footer/>
    </BrowserRouter>
  </React.StrictMode>
);