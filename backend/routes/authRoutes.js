const express = require('express');
const router = express.Router();
const { register, loginInit, loginVerify, verifyEmail } = require('../controllers/authController');

router.post('/register', register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login-init', loginInit);
router.post('/login-verify', loginVerify);

module.exports = router;
