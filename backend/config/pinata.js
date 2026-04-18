const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');

// Multer configured for memory so we don't need to persist files on the server storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadToPinata = async (fileBuffer, filename) => {
  const formData = new FormData();
  formData.append('file', fileBuffer, {
    filename: filename
  });

  const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
    maxBodyLength: "Infinity",
    headers: {
      'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_API_SECRET
    }
  });

  return res.data.IpfsHash; // CID
};

const uploadJSONToPinata = async (jsonData) => {
  const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", jsonData, {
    headers: {
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_API_SECRET
    }
  });

  return res.data.IpfsHash;
};

module.exports = { upload, uploadToPinata, uploadJSONToPinata };
