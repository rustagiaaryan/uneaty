const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  deliveryService: {
    type: mongoose.Schema.ObjectId,
    ref: 'DeliveryService',
    required: true
  },
  deliverer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    foodTruck: {
      type: String,
      required: true
    },
    itemName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true
    },
    notes: {
      type: String
    }
  }],
  deliveryLocation: {
    dorm: {
      type: String,
      required: [true, 'Please provide a dorm name']
    },
    floor: {
      type: String,
      required: [true, 'Please provide a floor number']
    },
    roomNumber: {
      type: String,
      required: [true, 'Please provide a room number']
    }
  },
  customerPhone: {
    type: String,
    required: [true, 'Please provide customer phone number']
  },
  status: {
    type: String,
    enum: [
      'pending', 
      'accepted', 
      'pickedUpCard', 
      'orderingFood', 
      'pickedUpFood', 
      'delivering', 
      'delivered', 
      'cancelled'
    ],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate total amount before saving
OrderSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    let itemTotal = 0;
    
    this.items.forEach(item => {
      itemTotal += item.price * item.quantity;
    });
    
    this.totalAmount = itemTotal + this.deliveryFee;
  }
  
  next();
});

module.exports = mongoose.model('Order', OrderSchema);