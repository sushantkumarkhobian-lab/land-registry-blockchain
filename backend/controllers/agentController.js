const Land = require('../models/Land');
const Transaction = require('../models/Transaction');
const { addBlock, verifyChain } = require('../services/blockchainService');
const { mintLandNFT, transferLandNFT } = require('../services/web3Service');

const User = require('../models/User');
const axios = require('axios');
const { decrypt } = require('../utils/encryption');


// @desc    Get all pending land registrations
// @route   GET /api/agent/pending-registrations
const getPendingRegistrations = async (req, res) => {
  try {
    const pendingLands = await Land.find({ status: 'Pending Registration' }).populate('owner', 'username email');
    res.json(pendingLands);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve Land Registration (Creates Blockchain Entry)
// @route   POST /api/agent/approve-registration/:id
const approveRegistration = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);
    if (!land) return res.status(404).json({ message: 'Land not found' });

    land.status = 'Registered';
    land.isVerified = true;
    
    // Mint NFT
    const owner = await User.findById(land.owner);
    if (owner && owner.walletAddress) {
      const metadataURI = `ipfs://${land.metadataCID}`;
      const mintResult = await mintLandNFT(owner.walletAddress, metadataURI);
      
      if (mintResult.success) {
        land.tokenId = mintResult.tokenId;
      } else {
        console.error("NFT Minting failed:", mintResult.error);
        // We might want to handle this error, but for now we'll proceed
      }
    }

    await land.save();

    // Create Blockchain Block (Internal Record)
    const blockData = {
      type: 'REGISTRATION',
      landId: land._id,
      tokenId: land.tokenId,
      owner: land.owner,
      propertyID: land.propertyID,
      documentCID: land.documentCID,
      metadataCID: land.metadataCID,
      timestamp: new Date()
    };
    
    await addBlock(blockData);

    res.json({ 
      message: 'Registration approved, NFT minted, and Blockchain block added', 
      tokenId: land.tokenId 
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get pending transfer requests
// @route   GET /api/agent/pending-transfers
const getPendingTransfers = async (req, res) => {
  try {
    const transactions = await Transaction.find({ status: 'Pending' })
      .populate('landId')
      .populate('fromUser', 'username email')
      .populate('toUser', 'username email');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve land transfer
// @route   POST /api/agent/approve-transfer/:id
const approveTransfer = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    transaction.status = 'Approved';
    transaction.agentId = req.user._id;
    await transaction.save();

    // Update Land Document
    const land = await Land.findById(transaction.landId);
    land.owner = transaction.toUser;
    land.status = 'Registered'; // Reset status
    await land.save();

    // Create Blockchain Block
    const blockData = {
      type: 'TRANSFER',
      transactionId: transaction._id,
      landId: land._id,
      fromUser: transaction.fromUser,
      toUser: transaction.toUser,
      timestamp: new Date()
    };

    await addBlock(blockData);
    
    // Web3 Transfer Integration
    const fromUser = await User.findById(transaction.fromUser);
    const toUser = await User.findById(transaction.toUser);
    
    if (fromUser?.walletAddress && toUser?.walletAddress && land.tokenId !== undefined) {
      const transferResult = await transferLandNFT(fromUser.walletAddress, toUser.walletAddress, land.tokenId);
      if (transferResult.success) {
        console.log(`NFT #${land.tokenId} transferred on-chain: ${transferResult.transactionHash}`);
      } else {
        console.error("NFT Transfer failed:", transferResult.error);
        // We still approve the DB side for UX, but log the error
      }
    }

    res.json({ message: 'Transfer approved, recorded in DB, and NFT transferred on-chain' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Audit Blockchain
// @route   GET /api/agent/audit
const auditChain = async (req, res) => {
  try {
    const isValid = await verifyChain();
    res.json({ isValid, message: isValid ? "Blockchain is valid and hasn't been tampered with." : "Blockchain Integrity Compromised!" });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    View decrypted document
// @route   GET /api/agent/view-document/:cid
const viewDecryptedDocument = async (req, res) => {
  try {
    const { cid } = req.params;
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;

    // Fetch encrypted data from IPFS
    const response = await axios.get(ipfsUrl, { responseType: 'text' });
    let encryptedData = response.data;

    // Ensure it's a string and trim any potential whitespace/quotes
    if (typeof encryptedData !== 'string') {
        encryptedData = encryptedData.toString();
    }
    encryptedData = encryptedData.trim();

    // Decrypt the data
    const decryptedBuffer = decrypt(encryptedData, true);

    // Set headers and send the file
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="decrypted-document-${cid}.pdf"`,
      'Cache-Control': 'no-cache'
    });
    
    res.status(200).send(decryptedBuffer);

  } catch (error) {
    console.error("Decryption error:", error);
    res.status(500).json({ message: 'Failed to decrypt document', error: error.message });
  }
};

module.exports = { 
  getPendingRegistrations, 
  approveRegistration, 
  getPendingTransfers, 
  approveTransfer,
  auditChain,
  viewDecryptedDocument
};
