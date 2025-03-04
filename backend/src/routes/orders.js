// In backend/src/routes/orders.js
const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');

const { protect, authorize } = require('../middleware/auth');

// Protect all routes - ensures req.user is available
router.use(protect);

// Routes
router.route('/')
  .get(getOrders)
  .post(authorize('customer'), createOrder);

router.route('/:id')
  .get(getOrder);

router.put('/:id/status', authorize('deliverer', 'admin'), updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

module.exports = router;