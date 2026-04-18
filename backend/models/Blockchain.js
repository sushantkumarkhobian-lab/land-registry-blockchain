const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  index: {
    type: Number,
    required: true,
    unique: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  data: {
    type: Object, // Stores landId, owner, transaction details 
    required: true
  },
  previousHash: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true,
    unique: true
  }
});

const Blockchain = mongoose.model('Blockchain', blockSchema);
module.exports = Blockchain;
