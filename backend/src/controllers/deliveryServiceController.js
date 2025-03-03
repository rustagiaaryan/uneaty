const DeliveryService = require('../models/DeliveryService');

// @desc    Create new delivery service
// @route   POST /api/delivery-services
// @access  Private/Deliverer
exports.createDeliveryService = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.deliverer = req.user.id;

    const deliveryService = await DeliveryService.create(req.body);

    res.status(201).json({
      success: true,
      data: deliveryService
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all delivery services
// @route   GET /api/delivery-services
// @access  Public
exports.getDeliveryServices = async (req, res, next) => {
  try {
    // Get all active delivery services
    const deliveryServices = await DeliveryService.find({ isActive: true });

    res.status(200).json({
      success: true,
      count: deliveryServices.length,
      data: deliveryServices
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single delivery service
// @route   GET /api/delivery-services/:id
// @access  Public
exports.getDeliveryService = async (req, res, next) => {
  try {
    const deliveryService = await DeliveryService.findById(req.params.id);

    if (!deliveryService) {
      return res.status(404).json({
        success: false,
        error: 'Delivery service not found'
      });
    }

    res.status(200).json({
      success: true,
      data: deliveryService
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update delivery service
// @route   PUT /api/delivery-services/:id
// @access  Private/Deliverer
exports.updateDeliveryService = async (req, res, next) => {
  try {
    let deliveryService = await DeliveryService.findById(req.params.id);

    if (!deliveryService) {
      return res.status(404).json({
        success: false,
        error: 'Delivery service not found'
      });
    }

    // Make sure user is the delivery service owner
    if (deliveryService.deliverer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this delivery service'
      });
    }

    deliveryService = await DeliveryService.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: deliveryService
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete delivery service
// @route   DELETE /api/delivery-services/:id
// @access  Private/Deliverer
exports.deleteDeliveryService = async (req, res, next) => {
  try {
    const deliveryService = await DeliveryService.findById(req.params.id);

    if (!deliveryService) {
      return res.status(404).json({
        success: false,
        error: 'Delivery service not found'
      });
    }

    // Make sure user is the delivery service owner
    if (deliveryService.deliverer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this delivery service'
      });
    }

    await deliveryService.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};