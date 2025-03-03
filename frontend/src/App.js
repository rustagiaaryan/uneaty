import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import DelivererDashboard from './pages/DelivererDashboard';
import About from './pages/About';
import Unauthorized from './pages/Unauthorized';
import './App.css';

// Add Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            path="/customer-dashboard"
            element={
              <PrivateRoute roles={['customer', 'admin']}>
                <CustomerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/deliverer-dashboard"
            element={
              <PrivateRoute roles={['deliverer', 'admin']}>
                <DelivererDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;