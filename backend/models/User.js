const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['customer', 'agent', 'admin'],
    default: 'customer'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'accepted'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  // Document uploaded by Admin/Agent for verification
  officialDocument: {
    type: String,
    required: false
  },
  // QR secret for Agent multi-factor auth
  qrSecret: {
    type: String,
    select: false // Excluded by default
  },
  walletAddress: {
    type: String,
    unique: true,
    sparse: true // Allows null values for pre-existing users
  },
  walletPrivateKey: {
    type: String,
    select: false // Never return by default
  }
}, {
  timestamps: true
});

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Password verification method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
