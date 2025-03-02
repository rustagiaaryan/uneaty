const express = require('express');
const router = express.Router();

// @route   GET api/delivery-services
// @desc    Get all delivery services (placeholder)
// @access  Public
router.get('/', (req, res) => {
  res.json({ message: 'Get all delivery services route' });
});

module.exports = router;