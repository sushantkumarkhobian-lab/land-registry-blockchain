const express = require('express');
const router = express.Router();
const { registerLand, initiateTransfer, getMyLands, getLandDetails, getAllPublicLands, sellLand, getLandsForSale, removeLandFromSale, initiatePurchase } = require('../controllers/landController');

const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/pinata');

router.post('/register', protect, upload.single('document'), registerLand);
router.post('/transfer', protect, initiateTransfer);
router.post('/sell/:id', protect, sellLand);
router.post('/remove-sale/:id', protect, removeLandFromSale);
router.get('/my-lands', protect, getMyLands);
router.get('/for-sale', protect, getLandsForSale);
router.get('/all-public', protect, getAllPublicLands);
router.post('/purchase', protect, initiatePurchase);

router.get('/:id', protect, getLandDetails);

module.exports = router;
