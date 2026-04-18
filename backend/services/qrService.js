const QRCode = require('qrcode');

const generateQR = async (userId, customSecret) => {
  try {
    // We encode the user's ID and a custom secret in the QR
    const qrData = JSON.stringify({ id: userId, secret: customSecret });
    const qrImage = await QRCode.toDataURL(qrData);
    return qrImage;
  } catch (error) {
    console.error('Error generating QR code', error);
    throw new Error('Could not generate QR Code');
  }
};

module.exports = { generateQR };
