const OTP = require('../models/OTP');
const sendEmail = require('./emailService');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
};

const sendOTPEmail = async (email) => {
  const otp = generateOTP();
  
  // Save or Update OTP in DB
  await OTP.findOneAndUpdate(
    { email },
    { otp },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const message = `Your login OTP for the Land Registry System is: ${otp}. It is valid for 5 minutes.`;
  
  await sendEmail({
    email,
    subject: 'Your Login OTP',
    message
  });
};

const verifyOTP = async (email, otpInput) => {
  const record = await OTP.findOne({ email });
  if (!record || record.otp !== otpInput) {
    return false;
  }
  // Delete after use
  await OTP.deleteOne({ email });
  return true;
};

module.exports = { sendOTPEmail, verifyOTP };
