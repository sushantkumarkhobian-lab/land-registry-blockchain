const mongoose = require('mongoose');

const landSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  area: {
    type: Number,
    required: true // Area in square feet/meters
  },
  address: {
    type: String,
    required: true
  },
  propertyID: {
    type: String,
    required: true,
    unique: true
  },
  documentCID: {
    type: String, // IPFS CID returned from Pinata
    required: true 
  },
  status: {
    type: String,
    enum: ['Pending Registration', 'Registered', 'Transfer Pending'],
    default: 'Pending Registration'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isForSale: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    default: 0
  },
  tokenId: {
    type: Number,
    unique: true,
    sparse: true
  },
  metadataCID: {
    type: String
  }
}, {
  timestamps: true
});

const Land = mongoose.model('Land', landSchema);
module.exports = Land;
