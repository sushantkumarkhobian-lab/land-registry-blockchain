const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTPEmail, verifyOTP } = require('../services/otpService');
const { generateQR } = require('../services/qrService');
const sendEmail = require('../services/emailService');
const crypto = require('crypto');
const Log = require('../models/Log');
const { ethers } = require('ethers');
const { encrypt } = require('../utils/encryption');


const logActivity = async (userId, username, activity, details = {}) => {
  try {
    await Log.create({ user: userId, username, activity, details });
  } catch (err) {
    console.error("Logging failed", err);
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const mongoose = require('mongoose');

// Generate a temporary 15min token for email verification
const generateVerificationToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// @desc    Register a user
// @route   POST /api/auth/register
const register = async (req, res) => {
  const { username, email, password, role, officialDocument } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Agent must provide an official document
    if (role === 'agent' && !officialDocument) {
      return res.status(400).json({ message: 'Official document is required for Agent registration' });
    }

    // Generate a predefined ObjectId so QR code can safely store it
    const newUserId = new mongoose.Types.ObjectId();

    let qrSecret = null;
    let qrCode = null;
    
    if (role === 'agent') {
      qrSecret = crypto.randomBytes(20).toString('hex');
      qrCode = await generateQR(newUserId.toString(), qrSecret);
    }

    // Embed all data into a secure JWT, DO NOT save to DB yet.
    const pendingUserData = {
      _id: newUserId.toString(),
      username,
      email,
      password,
      role: role || 'customer',
      qrSecret,
      officialDocument,
      status: (role === 'agent') ? 'pending' : 'accepted'
    };

    // Send Verification Email with embedded data
    const verifyToken = generateVerificationToken({ pendingUser: pendingUserData });
    const verifyUrl = `http://localhost:3000/verify-email?token=${verifyToken}`;
    const message = `Welcome to the Land Registry System!\n\nPlease click the link below to verify your email address. Your account will not be created until you click this link:\n${verifyUrl}`;
    
    await sendEmail({
      email: email,
      subject: 'Verify Your Email Address',
      message
    });

    res.status(200).json({
      message: 'Registration initiated! Please check your email to verify and finalize your account creation.',
      _id: newUserId.toString(),
      username,
      email,
      role: role || 'customer',
      qrCode // Automatically trigger the download
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify Email User
// @route   GET /api/auth/verify-email/:token
const verifyEmail = async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const pendingUser = decoded.pendingUser;

    if (!pendingUser) {
      return res.status(400).json({ message: 'Invalid token payload' });
    }

    const userExists = await User.findOne({ email: pendingUser.email });
    if (userExists) {
      if (userExists.isEmailVerified) {
        return res.json({ message: 'Email successfully verified and account has been created! You can now login.' });
      }
      return res.status(400).json({ message: 'Account is already verified and exists.' });
    }

    // Generate Wallet for the user
    const wallet = ethers.Wallet.createRandom();
    const walletAddress = wallet.address;
    const walletPrivateKey = encrypt(wallet.privateKey);

    // Now securely create the user in the DB
    await User.create({
      _id: pendingUser._id,
      username: pendingUser.username,
      email: pendingUser.email,
      password: pendingUser.password, // Pre-save hook in User model will hash this!
      role: pendingUser.role,
      qrSecret: pendingUser.qrSecret,
      status: pendingUser.status,
      officialDocument: pendingUser.officialDocument,
      isEmailVerified: true,
      walletAddress,
      walletPrivateKey
    });


    res.json({ message: 'Email successfully verified and account has been created! You can now login.' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired verification link' });
  }
};

// @desc    Step 1: Initiate Login (Verify Password + trigger OTP)
// @route   POST /api/auth/login-init
const loginInit = async (req, res) => {
  const { username, password, qrCodeData } = req.body;
  try {
    // Direct Admin Login (skips OTP)
    if (username === 'admin' && password === 'admin') {
       // Ideally we'd still check if the account exists, but for 'admin/admin' shortcut:
       let adminUser = await User.findOne({ username: 'admin' });
       if (!adminUser) {
          // Auto-seed if not exists (for convenience during development as requested)
          adminUser = await User.create({
            username: 'admin',
            email: 'admin@system.gov',
            password: 'admin', // already handled by pre-save hook
            role: 'admin',
            isEmailVerified: true,
            status: 'accepted'
          });
       }
       
       await logActivity(adminUser._id, adminUser.username, 'Admin Login (Direct)');
       return res.json({
         _id: adminUser._id,
         username: adminUser.username,
         email: adminUser.email,
         role: adminUser.role,
         walletAddress: adminUser.walletAddress,
         token: generateToken(adminUser._id)
       });

    }

    const user = await User.findOne({ username }).select('+qrSecret');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'Please verify your email address before logging in' });
    }

    // Check if Agent is accepted by Admin
    if (user.role === 'agent') {
      if (user.status === 'pending') {
        return res.status(403).json({ message: 'Your agent account is pending verification by the Admin.' });
      } else if (user.status === 'rejected') {
        return res.status(403).json({ message: 'Your agent account request was rejected by the Admin. Please contact support if you believe this is an error.' });
      }
    }

    // If agent, they must provide QR Code data
    if (user.role === 'agent') {
      if (!qrCodeData) return res.status(401).json({ message: 'QR Code is required for Agent login' });
      
      try {
         const parsedQR = JSON.parse(qrCodeData);
         if (parsedQR.id !== user._id.toString() || parsedQR.secret !== user.qrSecret) {
           return res.status(401).json({ message: 'Invalid QR Code' });
         }
      } catch (e) {
         return res.status(401).json({ message: 'Invalid QR Code Format' });
      }
    }

    // Correct credentials/QR, now send OTP
    await sendOTPEmail(user.email);
    res.json({ message: 'OTP sent to email', email: user.email });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Step 2: Verify OTP and return Token
// @route   POST /api/auth/login-verify
const loginVerify = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const isValid = await verifyOTP(email, otp);
    if (!isValid) return res.status(401).json({ message: 'Invalid or expired OTP' });

    const user = await User.findOne({ email });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress,
      token: generateToken(user._id)
    });

    
    await logActivity(user._id, user.username, 'Login (OTP Verified)');
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, loginInit, loginVerify, verifyEmail };
