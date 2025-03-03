import React from 'react';

const CustomerDashboard = () => {
  return (
    <div className="container mt-4">
      <h2>Customer Dashboard</h2>
      <p>Welcome to your customer dashboard. You can order food from here.</p>
      
      <div className="card mt-4">
        <div className="card-header">
          <h4>Available Deliverers</h4>
        </div>
        <div className="card-body">
          <p>No deliverers available at the moment.</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;