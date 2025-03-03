import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';

const DeliveryServiceList = ({ onServiceSelect }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useContext(AuthContext);
  const isCustomer = user && user.role === 'customer';

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/delivery-services');
        setServices(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching delivery services');
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  if (loading) return <p>Loading delivery services...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (services.length === 0) return <p>No delivery services available at this time.</p>;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      {services.map((service) => (
        <div className="card mb-3" key={service._id}>
          <div className="card-header">
            <h5>Delivery Service</h5>
          </div>
          <div className="card-body">
            <p><strong>Time:</strong> {formatTime(service.startTime)} - {formatTime(service.endTime)}</p>
            <p><strong>Food Trucks:</strong> {service.foodTrucks.map(truck => truck.name).join(', ')}</p>
            <p><strong>Delivery Fee:</strong> ${service.deliveryFee.toFixed(2)}</p>
            <p><strong>Orders Capacity:</strong> {service.currentOrders}/{service.maxOrders}</p>
            
            {isCustomer && service.currentOrders < service.maxOrders && (
              <button 
                className="btn btn-primary" 
                onClick={() => onServiceSelect(service)}
                disabled={service.currentOrders >= service.maxOrders}
              >
                Order from this Service
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DeliveryServiceList;