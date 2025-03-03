const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  salt: {
    type: String,
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    match: [
      /^[0-9]{10}$/,
      'Please provide a valid 10-digit phone number'
    ]
  },
  role: {
    type: String,
    enum: ['customer', 'deliverer', 'admin'],
    default: 'customer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create password hash
UserSchema.methods.createHash = function(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.password = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex');
};

// Encrypt password using crypto
UserSchema.pre('save', function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  this.createHash(this.password);
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || 'devsecrethash123',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = function(enteredPassword) {
  const hash = crypto
    .pbkdf2Sync(enteredPassword, this.salt, 1000, 64, 'sha512')
    .toString('hex');
  return this.password === hash;
};

module.exports = mongoose.model('User', UserSchema);