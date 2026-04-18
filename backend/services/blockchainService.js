const crypto = require('crypto');
const Blockchain = require('../models/Blockchain');

const calculateHash = (index, previousHash, timestamp, data) => {
  return crypto.createHash('sha256').update(index + previousHash + timestamp + JSON.stringify(data)).digest('hex');
};

const createGenesisBlock = async () => {
  const existingGenesis = await Blockchain.findOne({ index: 0 });
  if (existingGenesis) return;

  const timestamp = new Date();
  const data = { message: "Genesis Block - Land Registry Initiated" };
  const hash = calculateHash(0, "0", timestamp, data);

  const genesisBlock = new Blockchain({
    index: 0,
    timestamp,
    data,
    previousHash: "0",
    hash
  });

  await genesisBlock.save();
  console.log('Genesis Block Created');
};

const addBlock = async (data) => {
  const lastBlock = await Blockchain.findOne().sort({ index: -1 });
  if (!lastBlock) {
    throw new Error("Blockchain not initialized");
  }

  const newIndex = lastBlock.index + 1;
  const timestamp = new Date();
  const previousHash = lastBlock.hash;
  const hash = calculateHash(newIndex, previousHash, timestamp, data);

  const newBlock = new Blockchain({
    index: newIndex,
    timestamp,
    data,
    previousHash,
    hash
  });

  await newBlock.save();
  return newBlock;
};

const verifyChain = async () => {
  const chain = await Blockchain.find().sort({ index: 1 });
  
  for (let i = 1; i < chain.length; i++) {
    const currentBlock = chain[i];
    const previousBlock = chain[i - 1];

    // Check if the current block's previous hash matches the previous block's hash
    if (currentBlock.previousHash !== previousBlock.hash) {
      return false;
    }

    // Recalculate hash and check
    const recalculatedHash = calculateHash(currentBlock.index, currentBlock.previousHash, currentBlock.timestamp, currentBlock.data);
    if (currentBlock.hash !== recalculatedHash) {
      return false;
    }
  }
  return true;
};

module.exports = { createGenesisBlock, addBlock, verifyChain };
