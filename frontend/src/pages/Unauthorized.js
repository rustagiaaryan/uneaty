import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="container mt-5 text-center">
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Unauthorized Access</h4>
        <p>You do not have permission to access this page.</p>
      </div>
      <Link to="/" className="btn btn-primary">
        Return to Home
      </Link>
    </div>
  );
};

export default Unauthorized;