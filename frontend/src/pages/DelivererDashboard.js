import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import DeliveryServiceForm from '../components/DeliveryServiceForm';
import AuthContext from '../context/AuthContext';

const DelivererDashboard = () => {
  const [myServices, setMyServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch deliverer's services
        const servicesRes = await api.get('/delivery-services');
        // Filter only services created by this deliverer
        const filteredServices = servicesRes.data.data.filter(
          service => service.deliverer === user.id
        );
        setMyServices(filteredServices);
        
        // Fetch orders
        const ordersRes = await api.get('/orders');
        setOrders(ordersRes.data.data);
        
        setLoading(false);
      } catch (err) {
        setError('Error fetching data');
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleCreateSuccess = async () => {
    try {
      // Refresh services after creating a new one
      const res = await api.get('/delivery-services');
      const filteredServices = res.data.data.filter(
        service => service.deliverer === user.id
      );
      setMyServices(filteredServices);
      setShowForm(false);
    } catch (err) {
      setError('Error refreshing services');
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      
      // Refresh orders
      const res = await api.get('/orders');
      setOrders(res.data.data);
    } catch (err) {
      setError('Error updating order status');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="container mt-4">Loading...</div>;

  return (
    <div className="container mt-4">
      <h2>Deliverer Dashboard</h2>
      <p>Welcome to your deliverer dashboard, {user?.name}!</p>
      
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4>Your Delivery Services</h4>
              <button 
                className="btn btn-primary" 
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? 'Cancel' : 'Create New Service'}
              </button>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              
              {showForm && (
                <DeliveryServiceForm onSuccess={handleCreateSuccess} />
              )}
              
              {!showForm && (
                <>
                  {myServices.length === 0 ? (
                    <p>You haven't created any delivery services yet.</p>
                  ) : (
                    <div className="list-group">
                      {myServices.map(service => (
                        <div className="list-group-item list-group-item-action" key={service._id}>
                          <div className="d-flex w-100 justify-content-between">
                            <h5 className="mb-1">Service on {new Date(service.startTime).toLocaleDateString()}</h5>
                            <small>{service.currentOrders}/{service.maxOrders} orders</small>
                          </div>
                          <p className="mb-1">
                            Time: {formatTime(service.startTime)} - {formatTime(service.endTime)}
                          </p>
                          <p className="mb-1">
                            Food Trucks: {service.foodTrucks.map(truck => truck.name).join(', ')}
                          </p>
                          <small>Delivery Fee: ${service.deliveryFee.toFixed(2)}</small>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h4>Your Orders</h4>
            </div>
            <div className="card-body">
              {orders.length === 0 ? (
                <p>No orders to display.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Delivery Location</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id}>
                          <td>{order._id.substring(0, 8)}...</td>
                          <td>{order.customerPhone}</td>
                          <td>
                            {order.items.map((item, index) => (
                              <div key={index}>
                                {item.quantity}x {item.itemName} ({item.foodTruck})
                              </div>
                            ))}
                          </td>
                          <td>
                            {order.deliveryLocation.dorm}, Floor {order.deliveryLocation.floor}, 
                            Room {order.deliveryLocation.roomNumber}
                          </td>
                          <td>
                            <span className={`badge bg-${getStatusBadgeColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group">
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleStatusUpdate(order._id, getNextStatus(order.status))}
                                disabled={order.status === 'delivered' || order.status === 'cancelled'}
                              >
                                Update Status
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get the appropriate badge color
const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'pending': return 'secondary';
    case 'accepted': return 'info';
    case 'pickedUpCard': return 'primary';
    case 'orderingFood': return 'warning';
    case 'pickedUpFood': return 'info';
    case 'delivering': return 'primary';
    case 'delivered': return 'success';
    case 'cancelled': return 'danger';
    default: return 'secondary';
  }
};

// Helper function to determine the next status
const getNextStatus = (currentStatus) => {
  switch (currentStatus) {
    case 'pending': return 'accepted';
    case 'accepted': return 'pickedUpCard';
    case 'pickedUpCard': return 'orderingFood';
    case 'orderingFood': return 'pickedUpFood';
    case 'pickedUpFood': return 'delivering';
    case 'delivering': return 'delivered';
    default: return currentStatus;
  }
};

export default DelivererDashboard;