import React, { useState } from 'react';
import api from '../utils/api';

const foodTruckOptions = [
  { name: 'Fusion Eats', location: 'Westwood Plaza' },
  { name: 'Taco Time', location: 'Bruin Walk' },
  { name: 'Pho Wheels', location: 'De Neve Plaza' },
  { name: 'Burger Spot', location: 'Ackerman Union' },
  { name: 'Sushi Station', location: 'Court of Sciences' }
];

const DeliveryServiceForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    startTime: '',
    endTime: '',
    maxOrders: 5,
    deliveryFee: 3.99,
    foodTrucks: []
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { startTime, endTime, maxOrders, deliveryFee, foodTrucks } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFoodTruckChange = (e) => {
    const { value, checked } = e.target;
    const selectedTruck = foodTruckOptions.find(truck => truck.name === value);
    
    if (checked) {
      setFormData({
        ...formData,
        foodTrucks: [...foodTrucks, selectedTruck]
      });
    } else {
      setFormData({
        ...formData,
        foodTrucks: foodTrucks.filter(truck => truck.name !== value)
      });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (foodTrucks.length === 0) {
        throw new Error('Please select at least one food truck');
      }

      // Format dates for API
      const serviceData = {
        ...formData,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString()
      };

      await api.post('/delivery-services', serviceData);
      setFormData({
        startTime: '',
        endTime: '',
        maxOrders: 5,
        deliveryFee: 3.99,
        foodTrucks: []
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header bg-primary text-white">
        <h4>Create Delivery Service</h4>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit}>
          <div className="form-group mb-3">
            <label htmlFor="startTime">Start Time</label>
            <input
              type="datetime-local"
              className="form-control"
              id="startTime"
              name="startTime"
              value={startTime}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="endTime">End Time</label>
            <input
              type="datetime-local"
              className="form-control"
              id="endTime"
              name="endTime"
              value={endTime}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="maxOrders">Maximum Orders</label>
            <input
              type="number"
              className="form-control"
              id="maxOrders"
              name="maxOrders"
              min="1"
              max="20"
              value={maxOrders}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="deliveryFee">Delivery Fee ($)</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              id="deliveryFee"
              name="deliveryFee"
              min="0"
              value={deliveryFee}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label>Food Trucks</label>
            {foodTruckOptions.map((truck) => (
              <div className="form-check" key={truck.name}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={truck.name}
                  name="foodTrucks"
                  value={truck.name}
                  checked={foodTrucks.some(t => t.name === truck.name)}
                  onChange={handleFoodTruckChange}
                />
                <label className="form-check-label" htmlFor={truck.name}>
                  {truck.name} ({truck.location})
                </label>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Delivery Service'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DeliveryServiceForm;