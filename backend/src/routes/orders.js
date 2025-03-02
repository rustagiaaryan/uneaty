const express = require('express');
const router = express.Router();

// @route   GET api/orders
// @desc    Get all orders (placeholder)
// @access  Private
router.get('/', (req, res) => {
  res.json({ message: 'Get all orders route' });
});

module.exports = router;