import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const authLinks = (
    <ul className="navbar-nav ml-auto">
      {user && user.role === 'customer' && (
        <li className="nav-item">
          <Link to="/customer-dashboard" className="nav-link">
            Dashboard
          </Link>
        </li>
      )}
      {user && user.role === 'deliverer' && (
        <li className="nav-item">
          <Link to="/deliverer-dashboard" className="nav-link">
            Dashboard
          </Link>
        </li>
      )}
      <li className="nav-item">
        <span className="nav-link">Hello, {user && user.name}</span>
      </li>
      <li className="nav-item">
        <button onClick={handleLogout} className="btn btn-link nav-link">
          Logout
        </button>
      </li>
    </ul>
  );

  const guestLinks = (
    <ul className="navbar-nav ml-auto">
      <li className="nav-item">
        <Link to="/register" className="nav-link">
          Register
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/login" className="nav-link">
          Login
        </Link>
      </li>
    </ul>
  );

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link to="/" className="navbar-brand">
          UnEaty
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarMain"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className="nav-link">
                About
              </Link>
            </li>
          </ul>
          {isAuthenticated ? authLinks : guestLinks}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;