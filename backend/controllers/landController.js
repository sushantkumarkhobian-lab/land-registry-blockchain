const Land = require('../models/Land');
const Transaction = require('../models/Transaction');
const { uploadToPinata, uploadJSONToPinata } = require('../config/pinata');
const { addBlock } = require('../services/blockchainService');
const { encrypt } = require('../utils/encryption');


// @desc    Register new land
// @route   POST /api/land/register
const registerLand = async (req, res) => {
  try {
    const { area, address, propertyID } = req.body;
    
    if (!req.file) return res.status(400).json({ message: "Property Document is required" });

    // Encrypt File buffer before uploading to Pinata
    const encryptedBuffer = Buffer.from(encrypt(req.file.buffer), 'utf-8');
    const documentCID = await uploadToPinata(encryptedBuffer, `${propertyID}-doc-encrypted`);

    // Create and Encrypt Metadata
    const metadata = {
      name: `Land Parcel #${propertyID}`,
      description: "Official land ownership record",
      attributes: [
        { trait_type: "Area", value: area },
        { trait_type: "Address", value: address },
        { trait_type: "PropertyID", value: propertyID }
      ],
      documentCID: documentCID // Link to encrypted document
    };

    const encryptedMetadata = {
      data: encrypt(JSON.stringify(metadata))
    };

    const metadataCID = await uploadJSONToPinata(encryptedMetadata);

    const newLand = await Land.create({
      owner: req.user._id,
      area,
      address,
      propertyID,
      documentCID,
      metadataCID
    });

    res.status(201).json({ 
      message: "Registration applied successfully, pending agent approval", 
      land: newLand,
      ipfsLinks: {
        document: `https://gateway.pinata.cloud/ipfs/${documentCID}`,
        metadata: `https://gateway.pinata.cloud/ipfs/${metadataCID}`
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Initiate land transfer
// @route   POST /api/land/transfer
const initiateTransfer = async (req, res) => {
  try {
    const { landId, toUserId } = req.body;
    
    const land = await Land.findById(landId);
    if (!land) return res.status(404).json({ message: "Land not found" });

    if (land.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You don't own this land" });
    }

    if (land.status !== 'Registered') {
      return res.status(400).json({ message: "Land must be fully registered to transfer" });
    }

    // Mark land as transfer pending
    land.status = 'Transfer Pending';
    await land.save();

    const transaction = await Transaction.create({
      landId,
      fromUser: req.user._id,
      toUser: toUserId
    });

    res.status(201).json({ message: "Transfer initiated, waiting for agent approval", transaction });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all lands owned by user
// @route   GET /api/land/my-lands
const getMyLands = async (req, res) => {
  try {
    const lands = await Land.find({ owner: req.user._id });
    res.json(lands);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all details of a specific land by verification
// @route   GET /api/land/:id
const getLandDetails = async (req, res) => {
  try {
    const queryId = req.params.id;
    let query = { $or: [{ propertyID: queryId }, { documentCID: queryId }] };
    
    // If it's a valid ObjectId, we can also search by _id
    if (require('mongoose').Types.ObjectId.isValid(queryId)) {
      query.$or.push({ _id: queryId });
    }

    const land = await Land.findOne(query).populate('owner', 'username email');
    if (!land) return res.status(404).json({ message: 'Land not found' });
    
    res.json(land);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all public lands for map view
// @route   GET /api/land/all-public
const getAllPublicLands = async (req, res) => {
  try {
    const lands = await Land.find().select('propertyID status isForSale price');
    res.json(lands);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark land for sale
// @route   POST /api/land/sell/:id
const sellLand = async (req, res) => {
  try {
    const { price } = req.body;
    const land = await Land.findById(req.params.id);
    if (!land) return res.status(404).json({ message: "Land not found" });

    if (land.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You don't own this land" });
    }

    if (land.status !== 'Registered') {
      return res.status(400).json({ message: "Land must be fully registered to sell" });
    }

    land.isForSale = true;
    land.price = price || 0;
    await land.save();

    res.json({ message: "Land is now marked for sale!", land });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all lands for sale
// @route   GET /api/land/for-sale
const getLandsForSale = async (req, res) => {
  try {
    const lands = await Land.find({ isForSale: true }).populate('owner', 'username email walletAddress');
    res.json(lands);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Remove land from sale
// @route   POST /api/land/remove-sale/:id
const removeLandFromSale = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);
    if (!land) return res.status(404).json({ message: "Land not found" });

    if (land.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You don't own this land" });
    }

    land.isForSale = false;
    land.price = 0;
    await land.save();

    res.json({ message: "Land removed from sale successfully", land });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Initiate purchase request for a land for sale
// @route   POST /api/land/purchase
const initiatePurchase = async (req, res) => {
  try {
    const { landId } = req.body;
    const buyerId = req.user._id;

    const land = await Land.findById(landId);
    if (!land) return res.status(404).json({ message: "Land not found" });

    if (!land.isForSale) {
      return res.status(400).json({ message: "This land is not available for purchase" });
    }

    if (land.owner.toString() === buyerId.toString()) {
      return res.status(400).json({ message: "You already own this land" });
    }

    if (land.status !== 'Registered') {
      return res.status(400).json({ message: "Land must be fully registered to purchase" });
    }

    // Mark land as transfer pending and remove from sale
    land.status = 'Transfer Pending';
    land.isForSale = false;
    await land.save();

    const transaction = await Transaction.create({
      landId,
      fromUser: land.owner,
      toUser: buyerId
    });

    res.status(201).json({ 
      message: "Purchase request initiated! A Government Agent will now need to approve the transfer.", 
      transaction 
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { registerLand, initiateTransfer, getMyLands, getLandDetails, getAllPublicLands, sellLand, getLandsForSale, removeLandFromSale, initiatePurchase };
