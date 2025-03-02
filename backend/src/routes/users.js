const express = require('express');
const router = express.Router();

// @route   GET api/users
// @desc    Get all users (placeholder)
// @access  Private/Admin
router.get('/', (req, res) => {
  res.json({ message: 'Get all users route' });
});

module.exports = router;