# land-registry-blockchain
This is a decentralized Land Registry system using Ethereum to secure property records. Each parcel is an ERC-721 NFT, ensuring tamper-proof deeds. Built with React and Node.js, it features MFA auth, AES-256 encrypted storage on IPFS, and a GIS map. Smart contracts automate transfers, while transparent logs prevent fraud in real estate.



# 🏰 Land Registry Blockchain System

A secure, transparent, and decentralized land ownership management system built using Ethereum Blockchain, React, and Node.js. This platform allows users to register, transfer, and sell land parcels as **ERC-721 NFTs**, ensuring immutable ownership records and tamper-proof documentation.

---

## 🚀 Key Features

### 1. 🔐 Secure Authentication & Role-Based Access
*   **RBAC (Role-Based Access Control):** Dedicated dashboards for **Admin**, **Government Agents**, and **Customers**.
*   **Multi-Factor Authentication (MFA):** Secure login via **Email OTP (One-Time Password)** and QR code secondary verification.
*   **Security:** Industry-standard password hashing with `bcryptjs` and session security using **JSON Web Tokens (JWT)**.

### 2. 💎 Blockchain & NFT Integration
*   **Digital Land Deeds (NFTs):** Every verified land parcel is minted as a unique **ERC-721 NFT** on the blockchain.
*   **Provenance & History:** Absolute transparency of ownership history, traceable back to the original registration.
*   **On-Chain Transfers:** Direct peer-to-peer ownership transfers triggered by smart contracts upon approval.
*   **System Integrity Audit:** A built-in tool that verifies the entire blockchain ledger to ensure zero tampering with records.

### 3. 🗺️ Land Management & Marketplace
*   **Interactive GIS Map:** Real-time visualization of land parcels using **Leaflet.js**, allowing users to select and view property boundaries.
*   **Official Registration:** Streamlined workflow for submitting land details and legal documents.
*   **Marketplace:** Public listing of lands for sale; users can browse, search, and purchase properties directly.
*   **Document Security:** Legal documents are encrypted using **AES-256** before being uploaded to **IPFS**, ensuring only authorized agents can view the decrypted original files.

---

## 🛠️ Technology Stack

### **Frontend**
- **React (Vite):** Core UI framework for high-performance components.
- **React-Leaflet:** GIS integration for interactive land maps.
- **Lucide React:** Modern iconography.
- **React Router:** SPA navigation.
- **Axios:** API communication.

### **Backend**
- **Node.js & Express:** Scalable backend server architecture.
- **MongoDB & Mongoose:** NoSQL database for metadata and user profiles.
- **Ethers.js:** Blockchain interaction library.
- **Nodemailer:** Automated email delivery for OTPs.
- **Multer:** Secure handled file uploads.
- **QRcode:** Dynamic QR code generation for verification.

### **Blockchain & Storage**
- **Solidity (0.8.19):** Smart contract language (ERC-721 standard).
- **Ganache:** Local Ethereum blockchain for development.
- **IPFS (via Pinata):** Decentralized storage for encrypted land documents.

---

## 🏁 Installation & Local Setup

Follow these steps to get the project running on your local machine.

### 1. Prerequisites
- **Node.js** (v16+)
- **MongoDB** (Local or Atlas)
- **Ganache** (UI or CLI)
- **Pinata Account** (For IPFS storage)
- **Gmail Account** (For automated OTPs)

### 2. Clone and Install
```bash
git clone https://github.com/sushantkumarkhobian-lab/land-registry-blockchain.git
cd land-registry-blockchain

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 3. External Services Setup

#### **A. MongoDB Setup**
1. Ensure MongoDB is running locally at `mongodb://localhost:27017/`.
2. Create a database named `land_registry`.
3. The system will automatically manage the following collections:
   - `users`: Stores user profiles and roles.
   - `lands`: Stores property details and IPFS links.
   - `transactions`: Records ownership transfer requests.
   - `logs`: System activity and audit trails.
   - `otps`: Temporary codes for secure login.
   - `blockchains`: Stores decentralized ledger synchronization states.

#### **B. Pinata (IPFS) Setup**
1. Create a free account at [Pinata](https://www.pinata.cloud/).
2. Generate an **API Key** and **Secret Key**.

#### **C. Email (Nodemailer) Setup**
1. Use a Gmail account.
2. Enable 2-Step Verification and generate an **App Password** (Settings > Security > App Passwords).

### 4. Blockchain Deployment
1. Open **Ganache** and start a workspace at `http://127.0.0.1:7545`.
2. Open [Remix IDE](https://remix.ethereum.org/).
3. Load `backend/contracts/LandRegistry.sol`.
4. Compile using Solidity `0.8.19` (Set EVM Version to **Paris** in Advanced Configurations to avoid Gas Errors).
5. In the "Deploy" tab, select "Dev - Ganache Provider" and deploy the contract.
6. **Copy the Contract Address** and one **Private Key** from Ganache.

### 5. Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/land_registry
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_api_secret
AES_SECRET_KEY=your_encryption_secret
RPC_URL=http://127.0.0.1:7545
CONTRACT_ADDRESS=your_deployed_contract_address
ADMIN_PRIVATE_KEY=your_ganache_private_key
```

### 6. Run the Project
Open two terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm start 
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

The application will be live at `http://localhost:3000`.

---
*Developed with transparency and security in mind.*
