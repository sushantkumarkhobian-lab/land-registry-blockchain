const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Contract configuration
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:7545'; // Default Ganache RPC
const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Load ABI (this assumes we have a way to save it or we inline it)
// For this demo, I will inline the ABI of LandRegistry
const CONTRACT_ABI = [
    "function mintLand(address to, string memory uri) public returns (uint256)",
    "function transferLand(address from, address to, uint256 tokenId) public",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function tokenURI(uint256 tokenId) public view returns (string memory)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"

];

const getContract = () => {
    if (!PRIVATE_KEY || !CONTRACT_ADDRESS) {
        throw new Error("Missing Web3 Configuration: ADMIN_PRIVATE_KEY or CONTRACT_ADDRESS");
    }
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
};

const mintLandNFT = async (toAddress, metadataURI) => {
    try {
        const contract = getContract();
        console.log(`Minting NFT for ${toAddress} with URI ${metadataURI}...`);
        
        const tx = await contract.mintLand(toAddress, metadataURI);
        const receipt = await tx.wait();
        
        // In Ethers v6, we look for logs manually or use contract interface
        // For simplicity, we'll assume the first Transfer event has our tokenId
        const log = receipt.logs.find(l => l.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase());
        const tokenId = parseInt(log.topics[3], 16);
        
        return {
            success: true,
            tokenId,
            transactionHash: receipt.hash
        };
    } catch (error) {
        console.error("Web3 Minting Error:", error);
        return { success: false, error: error.message };
    }
};

const transferLandNFT = async (fromAddress, toAddress, tokenId) => {
    try {
        const contract = getContract();
        console.log(`Transferring NFT #${tokenId} from ${fromAddress} to ${toAddress}...`);
        
        const tx = await contract.transferLand(fromAddress, toAddress, tokenId);
        const receipt = await tx.wait();
        
        return {
            success: true,
            transactionHash: receipt.hash
        };
    } catch (error) {
        console.error("Web3 Transfer Error:", error);
        return { success: false, error: error.message };
    }
};

module.exports = { mintLandNFT, transferLandNFT };

