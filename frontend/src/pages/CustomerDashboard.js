import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import DeliveryServiceList from '../components/DeliveryServiceList';
import OrderForm from '../components/OrderForm';
import AuthContext from '../context/AuthContext';

const CustomerDashboard = () => {
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setMyOrders(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching orders');
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/cancel`);
      
      // Refresh orders
      const res = await api.get('/orders');
      setMyOrders(res.data.data);
    } catch (err) {
      setError('Error cancelling order');
    }
  };

  const handleOrderSuccess = async () => {
    try {
      // Refresh orders after creating a new one
      const res = await api.get('/orders');
      setMyOrders(res.data.data);
      setSelectedService(null);
    } catch (err) {
      setError('Error refreshing orders');
    }
  };

  if (loading) return <div className="container mt-4">Loading...</div>;

  return (
    <div className="container mt-4">
      <h2>Customer Dashboard</h2>
      <p>Welcome to your customer dashboard, {user?.name}!</p>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {selectedService ? (
        <OrderForm 
          deliveryService={selectedService} 
          onSuccess={handleOrderSuccess} 
          onCancel={() => setSelectedService(null)} 
        />
      ) : (
        <div className="row mt-4">
          <div className="col-md-12">
            <div className="card mb-4">
              <div className="card-header">
                <h4>Available Delivery Services</h4>
              </div>
              <div className="card-body">
                <DeliveryServiceList onServiceSelect={handleServiceSelect} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h4>Your Orders</h4>
            </div>
            <div className="card-body">
              {myOrders.length === 0 ? (
                <p>You haven't placed any orders yet.</p>
              ) : (
                <div className="list-group">
                  {myOrders.map(order => (
                    <div className="list-group-item list-group-item-action" key={order._id}>
                      <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1">Order #{order._id.substring(0, 8)}</h5>
                        <span className={`badge bg-${getStatusBadgeColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="mb-1">
                        <strong>Items:</strong>
                      </p>
                      <ul>
                        {order.items.map((item, index) => (
                          <li key={index}>
                            {item.quantity}x {item.itemName} from {item.foodTruck} - ${(item.price * item.quantity).toFixed(2)}
                          </li>
                        ))}
                      </ul>
                      <p className="mb-1">
                        <strong>Delivery Location:</strong> {order.deliveryLocation.dorm}, 
                        Floor {order.deliveryLocation.floor}, Room {order.deliveryLocation.roomNumber}
                      </p>
                      <p className="mb-1">
                        <strong>Total:</strong> ${(
                          order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 
                          order.deliveryFee
                        ).toFixed(2)} (including ${order.deliveryFee.toFixed(2)} delivery fee)
                      </p>
                      <small>Ordered on {new Date(order.createdAt).toLocaleString()}</small>
                      
                      {order.status === 'pending' && (
                        <div className="mt-2">
                          <button 
                            className="btn btn-sm btn-danger" 
                            onClick={() => handleCancelOrder(order._id)}
                          >
                            Cancel Order
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
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

export default CustomerDashboard;