const Order = require('../models/Order');
const DeliveryService = require('../models/DeliveryService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Customer
exports.createOrder = async (req, res, next) => {
    try {
      console.log('Creating order with data:', req.body);
      
      req.body.customer = req.user.id;
  
      // Check if delivery service exists and is available
      const deliveryService = await DeliveryService.findById(req.body.deliveryService);
  
      if (!deliveryService) {
        return res.status(404).json({
          success: false,
          error: 'Delivery service not found'
        });
      }
  
      if (!deliveryService.isAvailable) {
        return res.status(400).json({
          success: false,
          error: 'Delivery service is not available'
        });
      }
  
      // Set deliverer from the delivery service
      req.body.deliverer = deliveryService.deliverer;
      
      // Set delivery fee from the delivery service
      req.body.deliveryFee = deliveryService.deliveryFee;
      
      // Calculate total amount
      const itemsTotal = req.body.items.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
      );
      req.body.totalAmount = itemsTotal + req.body.deliveryFee;
  
      // Create order
      const order = await Order.create(req.body);
  
      // Update delivery service current orders
      deliveryService.currentOrders += 1;
      await deliveryService.save();
  
      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      console.error('Order creation error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  };

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    let query;

    // If customer, only show their orders
    if (req.user.role === 'customer') {
      query = Order.find({ customer: req.user.id });
    } 
    // If deliverer, only show orders assigned to them
    else if (req.user.role === 'deliverer') {
      query = Order.find({ deliverer: req.user.id });
    } 
    // If admin, show all orders
    else {
      query = Order.find();
    }

    // Execute query
    const orders = await query;

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Make sure user has permission to view order
    if (
      req.user.role !== 'admin' &&
      order.customer.toString() !== req.user.id &&
      order.deliverer.toString() !== req.user.id
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Make sure user has permission to update order
    if (
      req.user.role !== 'admin' &&
      order.deliverer.toString() !== req.user.id
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this order'
      });
    }

    // Update order status
    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if order can be cancelled (only pending orders)
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Order cannot be cancelled at current status'
      });
    }

    // Make sure user has permission to cancel order
    if (
      req.user.role !== 'admin' &&
      order.customer.toString() !== req.user.id
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to cancel this order'
      });
    }

    // Update order status
    order.status = 'cancelled';
    await order.save();

    // Update delivery service current orders
    const deliveryService = await DeliveryService.findById(order.deliveryService);
    if (deliveryService) {
      deliveryService.currentOrders -= 1;
      await deliveryService.save();
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};