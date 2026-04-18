const app = require('./app');
const { createGenesisBlock } = require('./services/blockchainService');

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  // Initialize Genesis block on startup
  await createGenesisBlock();
});
