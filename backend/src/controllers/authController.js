const User = require('../models/User');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role
    });

    // Create token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
  
      // Validate email and password
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Please provide email and password'
        });
      }
  
      // Check for user - note we need to include salt for password verification
      const user = await User.findOne({ email }).select('+password +salt');
  
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
  
      // Check if password matches
      const isMatch = user.matchPassword(password);
  
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
  
      // Create token
      const token = user.getSignedJwtToken();
  
      res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  };

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};