import React from 'react';

const DelivererDashboard = () => {
  return (
    <div className="container mt-4">
      <h2>Deliverer Dashboard</h2>
      <p>Welcome to your deliverer dashboard. You can manage your delivery services from here.</p>
      
      <div className="card mt-4">
        <div className="card-header">
          <h4>Your Delivery Services</h4>
        </div>
        <div className="card-body">
          <p>You haven't created any delivery services yet.</p>
          <button className="btn btn-primary">Create New Delivery Service</button>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <h4>Pending Orders</h4>
        </div>
        <div className="card-body">
          <p>No pending orders at the moment.</p>
        </div>
      </div>
    </div>
  );
};

export default DelivererDashboard;