const mongoose = require('mongoose');

const DeliveryServiceSchema = new mongoose.Schema({
  deliverer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: [true, 'Please provide a start time']
  },
  endTime: {
    type: Date,
    required: [true, 'Please provide an end time']
  },
  maxOrders: {
    type: Number,
    required: [true, 'Please provide maximum number of orders'],
    min: [1, 'Maximum orders must be at least 1'],
    max: [20, 'Maximum orders cannot exceed 20']
  },
  currentOrders: {
    type: Number,
    default: 0
  },
  foodTrucks: [{
    name: {
      type: String,
      required: [true, 'Please provide food truck name']
    },
    location: {
      type: String,
      required: [true, 'Please provide food truck location']
    },
    menu: [{
      itemName: String,
      price: Number,
      description: String
    }]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  deliveryFee: {
    type: Number,
    required: [true, 'Please specify the delivery fee'],
    min: [0, 'Delivery fee cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for checking if service is currently available
DeliveryServiceSchema.virtual('isAvailable').get(function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startTime &&
    now <= this.endTime &&
    this.currentOrders < this.maxOrders
  );
});

// Virtual for calculating remaining order capacity
DeliveryServiceSchema.virtual('remainingCapacity').get(function() {
  return this.maxOrders - this.currentOrders;
});

// Middleware to check if dates are valid
DeliveryServiceSchema.pre('save', function(next) {
  if (this.startTime >= this.endTime) {
    const error = new Error('End time must be after start time');
    return next(error);
  }
  next();
});

module.exports = mongoose.model('DeliveryService', DeliveryServiceSchema);