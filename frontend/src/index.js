import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Add Routes and Route import
import App from './App'; // Sign-up page
import Login from './Login'; // Login page
import Dashboard from './Dashboard'; // Dashboard page
import ViewAll from './ViewAll';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} /> {/* Dashboard route */}
        <Route path="/view-all" element={<ViewAll />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
