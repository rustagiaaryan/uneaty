import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
    phone: '',
    role: 'customer'
  });
  const [alert, setAlert] = useState(null);

  const { register, isAuthenticated, error, clearError, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated, redirect based on role
    if (isAuthenticated && user) {
      if (user.role === 'customer') {
        navigate('/customer-dashboard');
      } else if (user.role === 'deliverer') {
        navigate('/deliverer-dashboard');
      }
    }

    // Show error alert if there's an error
    if (error) {
      setAlert({ type: 'danger', message: error });
      clearError();
    }
  }, [isAuthenticated, error, clearError, navigate, user]);

  const { name, email, password, password2, phone, role } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== password2) {
      setAlert({ type: 'danger', message: 'Passwords do not match' });
      return;
    }

    try {
      const registerData = { name, email, password, phone, role };
      await register(registerData);
    } catch (err) {
      setAlert({ type: 'danger', message: 'Registration failed' });
    }
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6 mx-auto">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4>Register for UnEaty</h4>
            </div>
            <div className="card-body">
              {alert && (
                <div className={`alert alert-${alert.type}`} role="alert">
                  {alert.message}
                </div>
              )}
              <form onSubmit={onSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={name}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    name="phone"
                    placeholder="10-digit number"
                    pattern="[0-9]{10}"
                    value={phone}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    minLength="6"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password2">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password2"
                    name="password2"
                    value={password2}
                    onChange={onChange}
                    minLength="6"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>I want to:</label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="role"
                      id="customer"
                      value="customer"
                      checked={role === 'customer'}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="customer">
                      Order food (Customer)
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="role"
                      id="deliverer"
                      value="deliverer"
                      checked={role === 'deliverer'}
                      onChange={onChange}
                    />
                    <label className="form-check-label" htmlFor="deliverer">
                      Deliver food (Deliverer)
                    </label>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  Register
                </button>
              </form>
            </div>
            <div className="card-footer">
              <p className="mb-0">
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;