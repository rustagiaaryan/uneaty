const express = require('express');
const router = express.Router();
const {
  getDeliveryServices,
  getDeliveryService,
  createDeliveryService,
  updateDeliveryService,
  deleteDeliveryService
} = require('../controllers/deliveryServiceController');

const { protect, authorize } = require('../middleware/auth');

// Routes
router.route('/')
  .get(getDeliveryServices)
  .post(protect, authorize('deliverer', 'admin'), createDeliveryService);

router.route('/:id')
  .get(getDeliveryService)
  .put(protect, authorize('deliverer', 'admin'), updateDeliveryService)
  .delete(protect, authorize('deliverer', 'admin'), deleteDeliveryService);

module.exports = router;