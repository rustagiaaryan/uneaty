import React, { useState, useContext } from 'react';
import api from '../utils/api';
import AuthContext from '../context/AuthContext';

const dormOptions = [
  'De Neve Plaza',
  'Dykstra Hall',
  'Hedrick Hall',
  'Rieber Hall',
  'Sproul Hall',
  'Sunset Village'
];

const OrderForm = ({ deliveryService, onSuccess, onCancel }) => {
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    items: [],
    deliveryLocation: {
      dorm: dormOptions[0],
      floor: '',
      roomNumber: ''
    },
    customerPhone: '',
    deliveryService: deliveryService._id
  });
  
  const [selectedFoodTruck, setSelectedFoodTruck] = useState(
    deliveryService.foodTrucks.length > 0 ? deliveryService.foodTrucks[0].name : ''
  );
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Generate some sample menu items for the selected food truck
  const getMenuItems = (foodTruckName) => {
    // In a real app, you would fetch these from the backend
    switch(foodTruckName) {
      case 'Fusion Eats':
        return [
          { name: 'Korean BBQ Bowl', price: 8.99 },
          { name: 'Teriyaki Chicken', price: 7.99 },
          { name: 'Vegetable Stir Fry', price: 6.99 }
        ];
      case 'Taco Time':
        return [
          { name: 'Carne Asada Taco', price: 3.50 },
          { name: 'Chicken Burrito', price: 7.99 },
          { name: 'Veggie Quesadilla', price: 6.50 }
        ];
      case 'Pho Wheels':
        return [
          { name: 'Beef Pho', price: 8.99 },
          { name: 'Chicken Pho', price: 8.50 },
          { name: 'Veggie Spring Rolls', price: 4.99 }
        ];
      case 'Burger Spot':
        return [
          { name: 'Classic Burger', price: 6.99 },
          { name: 'Cheeseburger', price: 7.99 },
          { name: 'Veggie Burger', price: 7.50 }
        ];
      case 'Sushi Station':
        return [
          { name: 'California Roll', price: 5.99 },
          { name: 'Spicy Tuna Roll', price: 6.99 },
          { name: 'Veggie Roll', price: 5.50 }
        ];
      default:
        return [];
    }
  };

  const onChange = (e) => {
    if (e.target.name.includes('.')) {
      const [parent, child] = e.target.name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: e.target.value
        }
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleFoodTruckChange = (e) => {
    setSelectedFoodTruck(e.target.value);
    setSelectedItems([]);
  };

  const handleItemSelect = (item) => {
    // Check if item is already in the list
    const existingItem = selectedItems.find(i => 
      i.foodTruck === selectedFoodTruck && i.itemName === item.name
    );

    if (existingItem) {
      // Update quantity
      setSelectedItems(selectedItems.map(i => 
        (i.foodTruck === selectedFoodTruck && i.itemName === item.name)
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      // Add new item
      setSelectedItems([
        ...selectedItems,
        {
          foodTruck: selectedFoodTruck,
          itemName: item.name,
          price: item.price,
          quantity: 1,
          notes: ''
        }
      ]);
    }
  };

  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    setSelectedItems(selectedItems.map((item, i) => 
      i === index ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleNotesChange = (index, notes) => {
    setSelectedItems(selectedItems.map((item, i) => 
      i === index ? { ...item, notes } : item
    ));
  };

  const calculateTotal = () => {
    const itemsTotal = selectedItems.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
    return (itemsTotal + deliveryService.deliveryFee).toFixed(2);
  };

  // In OrderForm.js onSubmit function
const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      if (selectedItems.length === 0) {
        throw new Error('Please select at least one item');
      }
  
      // Calculate total amount for the order
      const itemsTotal = selectedItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      );
      const totalAmount = parseFloat((itemsTotal + deliveryService.deliveryFee).toFixed(2));
  
      // Create order data with totalAmount
      const orderData = {
        deliveryService: deliveryService._id,
        items: selectedItems.map(item => ({
          foodTruck: item.foodTruck,
          itemName: item.itemName,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes || ''
        })),
        deliveryLocation: {
          dorm: formData.deliveryLocation.dorm,
          floor: formData.deliveryLocation.floor,
          roomNumber: formData.deliveryLocation.roomNumber
        },
        customerPhone: formData.customerPhone,
        totalAmount: totalAmount,
        deliveryFee: deliveryService.deliveryFee
      };
      
      console.log('Sending order data:', orderData);
  
      // Make sure api.js has the token set in headers
      const response = await api.post('/orders', orderData);
      console.log('Order created successfully:', response.data);
      
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Order creation error:', err.response?.data || err);
      setError(err.response?.data?.error || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header bg-primary text-white">
        <h4>Create Order</h4>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <h5>Step 1: Select Food Truck</h5>
            <select 
              className="form-select" 
              value={selectedFoodTruck}
              onChange={handleFoodTruckChange}
              required
            >
              {deliveryService.foodTrucks.map(truck => (
                <option key={truck.name} value={truck.name}>
                  {truck.name} ({truck.location})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <h5>Step 2: Select Menu Items</h5>
            <div className="list-group mb-3">
              {getMenuItems(selectedFoodTruck).map(item => (
                <button
                  type="button"
                  key={item.name}
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  onClick={() => handleItemSelect(item)}
                >
                  <div>
                    <strong>{item.name}</strong>
                  </div>
                  <span>${item.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedItems.length > 0 && (
            <div className="mb-3">
              <h5>Selected Items</h5>
              <div className="list-group mb-3">
                {selectedItems.map((item, index) => (
                  <div key={index} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <strong>{item.foodTruck}</strong>: {item.itemName}
                      </div>
                      <div>${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleQuantityChange(index, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="mx-2">{item.quantity}</span>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleQuantityChange(index, item.quantity + 1)}
                      >
                        +
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-danger ms-auto"
                        onClick={() => handleRemoveItem(index)}
                      >
                        Remove
                      </button>
                    </div>
                    <div>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Special instructions (optional)"
                        value={item.notes}
                        onChange={(e) => handleNotesChange(index, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-3">
            <h5>Step 3: Delivery Information</h5>
            <div className="form-group mb-2">
              <label htmlFor="dorm">Dorm Building</label>
              <select
                className="form-select"
                id="dorm"
                name="deliveryLocation.dorm"
                value={formData.deliveryLocation.dorm}
                onChange={onChange}
                required
              >
                {dormOptions.map(dorm => (
                  <option key={dorm} value={dorm}>{dorm}</option>
                ))}
              </select>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group mb-2">
                  <label htmlFor="floor">Floor</label>
                  <input
                    type="number"
                    className="form-control"
                    id="floor"
                    name="deliveryLocation.floor"
                    value={formData.deliveryLocation.floor}
                    onChange={onChange}
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group mb-2">
                  <label htmlFor="roomNumber">Room Number</label>
                  <input
                    type="text"
                    className="form-control"
                    id="roomNumber"
                    name="deliveryLocation.roomNumber"
                    value={formData.deliveryLocation.roomNumber}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group mb-2">
              <label htmlFor="customerPhone">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                id="customerPhone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={onChange}
                placeholder="10-digit number"
                pattern="[0-9]{10}"
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <h5>Order Summary</h5>
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <span>Items Total:</span>
                  <span>${selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Delivery Fee:</span>
                  <span>${deliveryService.deliveryFee.toFixed(2)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>Total:</strong>
                  <strong>${calculateTotal()}</strong>
                </div>
                <div className="small text-muted mt-2">
                  * Payment will be made via BruinCard when the deliverer picks it up
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex">
            <button
              type="button"
              className="btn btn-secondary me-2"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || selectedItems.length === 0}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;