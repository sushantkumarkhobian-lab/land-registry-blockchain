const CryptoJS = require('crypto-js');

const SECRET_KEY = process.env.AES_SECRET_KEY || 'default_secret_key_123';

/**
 * Encrypt a string or buffer
 * @param {string|Buffer} data 
 * @returns {string} - Base64 encrypted string
 */
const encrypt = (data) => {
    const stringData = Buffer.isBuffer(data) ? data.toString('base64') : data;
    return CryptoJS.AES.encrypt(stringData, SECRET_KEY).toString();
};

/**
 * Decrypt a string
 * @param {string} ciphertext 
 * @param {boolean} isBuffer - Whether the original data was a buffer
 * @returns {string|Buffer}
 */
const decrypt = (ciphertext, isBuffer = false) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    
    if (isBuffer) {
        return Buffer.from(decryptedData, 'base64');
    }
    return decryptedData;
};

module.exports = { encrypt, decrypt };
