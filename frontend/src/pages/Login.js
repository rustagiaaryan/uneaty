import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [alert, setAlert] = useState(null);

  const { login, isAuthenticated, error, clearError, user } = useContext(AuthContext);
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

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await login(formData);
    } catch (err) {
      setAlert({ type: 'danger', message: 'Invalid credentials' });
    }
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6 mx-auto">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4>Login to UnEaty</h4>
            </div>
            <div className="card-body">
              {alert && (
                <div className={`alert alert-${alert.type}`} role="alert">
                  {alert.message}
                </div>
              )}
              <form onSubmit={onSubmit}>
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
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  Login
                </button>
              </form>
            </div>
            <div className="card-footer">
              <p className="mb-0">
                Don't have an account? <Link to="/register">Register</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;