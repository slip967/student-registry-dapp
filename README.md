# 🎓 Student Registry dApp - Polygon Amoy Testnet

A full-stack decentralized application for managing student records with NFT diploma functionality on Polygon Amoy Testnet.

## 📋 Features

- ✅ **Smart Contract** - Student registry with NFT diploma minting
- ✅ **Relayer Architecture** - Backend handles all transactions (users don't pay gas)
- ✅ **IPFS Integration** - Diploma documents stored on IPFS
- ✅ **NFT Diplomas** - Mint and transfer diplomas as NFTs
- ✅ **Real-time Statistics** - Dashboard with live stats
- ✅ **Dark/Light Mode** - Toggle theme
- ✅ **Responsive Design** - Works on all devices
- ✅ **Transaction Notifications** - Real-time feedback
- ✅ **MetaMask Integration** - Connect wallet for viewing NFTs

## 🏗️ Project Structure

```
StudentRegistryNew/
├── contracts/
│   └── StudentRegistry.sol    # Smart contract
├── scripts/
│   └── deploy.js              # Deployment script
├── server/
│   └── server.js              # Backend relayer server
├── client/
│   └── dashboard.html         # Frontend dashboard
├── hardhat.config.js          # Hardhat configuration
├── package.json               # Dependencies
└── .env                       # Environment variables
```

## 🚀 Step-by-Step Setup Guide

### **STEP 1: Navigate to Project Directory**

Open PowerShell or Command Prompt and navigate to the project:

```powershell
cd C:\Users\Dell\StudentRegistryNew
```

### **STEP 2: Create .env File**

Create a `.env` file in the project root with your credentials:

```env
INFURA_API_KEY=0d18f0546cc143b39ce1d9d05646772b
PRIVATE_KEY=928f6d205c82c514d75fa588c71ee3101976c57ea6ae44bcf29c23a9f7690d9c
CONTRACT_ADDRESS=
PORT=3000
```

**⚠️ Important:** The `CONTRACT_ADDRESS` will be filled after deployment.

### **STEP 3: Compile Smart Contract**

Compile the Solidity contract:

```powershell
npm run compile
```

You should see:
```
✅ Compiled successfully
```

### **STEP 4: Deploy Smart Contract**

Deploy the contract to Polygon Amoy Testnet:

```powershell
npm run deploy
```

**📝 What happens:**
1. The contract is deployed to Polygon Amoy
2. You'll see the contract address in the console
3. **COPY THIS ADDRESS!**

Example output:
```
✅ StudentRegistry deployed to: 0x1234567890abcdef1234567890abcdef12345678
```

### **STEP 5: Update .env File**

Open the `.env` file and add the contract address:

```env
CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

Replace with your actual deployed contract address.

### **STEP 6: Start Backend Server**

Start the relayer server:

```powershell
npm start
```

You should see:
```
🚀 Server running on http://localhost:3000
📡 Network: Polygon Amoy Testnet
📄 Contract: 0x1234567890abcdef1234567890abcdef12345678
✅ Connected to contract at: 0x1234567890abcdef1234567890abcdef12345678
```

**⚠️ Keep this terminal window open!** The server must stay running.

### **STEP 7: Open Frontend Dashboard**

1. Open a new browser window
2. Navigate to: `file:///C:/Users/Dell/StudentRegistryNew/client/dashboard.html`
   
   OR
   
   Double-click the `dashboard.html` file in File Explorer

3. The dashboard should load and show:
   - Stats cards (initially showing 0 students)
   - Add Student form
   - Quick Lookup
   - Mint Diploma section
   - Student List

## 📖 How to Use

### **1. Connect MetaMask Wallet**

1. Click the "Connect Wallet" button
2. Approve the connection in MetaMask
3. Button turns green when connected

### **2. Add a Student**

Fill in the form:
- **Student ID**: Unique number (e.g., 1, 2, 3...)
- **Full Name**: Student's name
- **Course**: Course name (e.g., "Computer Science")
- **Date of Birth**: Select date
- **Average Grade**: Number 0-100
- **Status**: Active, Graduated, or Suspended

Click "Add Student" - the transaction is signed by the relayer (no gas cost for you!)

### **3. View Students**

- Click "🔄 Refresh List" to see all students
- Use "Quick Lookup" to search by ID

### **4. Mint Diploma NFT**

1. Enter the Student ID
2. Click "Click to upload" and select a PDF/image file
3. Click "Mint Diploma NFT"
4. The file is uploaded to IPFS and an NFT is minted
5. You'll receive the Token ID

### **5. Transfer Diploma to Student**

1. Enter the Token ID (from minting)
2. Enter the student's wallet address (0x...)
3. Click "Transfer to Student"
4. The NFT will appear in the student's MetaMask wallet under "NFTs"

## 🔧 Troubleshooting

### **Problem: "Contract not initialized"**

**Solution:** Make sure:
1. Contract is deployed (`npm run deploy`)
2. `.env` file has `CONTRACT_ADDRESS` set
3. Server is restarted after updating `.env`

### **Problem: "Failed to connect wallet"**

**Solution:**
1. Install MetaMask extension
2. Make sure you're on Polygon Amoy network (or add it)
3. Refresh the page

### **Problem: "Transaction failed"**

**Solution:**
1. Check that the relayer wallet has MATIC tokens (for gas)
2. Get testnet MATIC from: https://faucet.polygon.technology/
3. Make sure you're using the correct network (Amoy)

### **Problem: Server won't start**

**Solution:**
1. Check if port 3000 is already in use
2. Change `PORT=3001` in `.env` if needed
3. Make sure all dependencies are installed: `npm install`

### **Problem: IPFS upload fails**

**Solution:**
- The app uses a public IPFS gateway
- For production, consider using Pinata or Web3.Storage
- For now, it will use a mock hash if IPFS fails

## 🌐 Network Information

- **Network Name:** Polygon Amoy Testnet
- **Chain ID:** 80002
- **RPC URL:** `https://polygon-amoy.infura.io/v3/YOUR_API_KEY`
- **Block Explorer:** https://amoy.polygonscan.com/

## 📝 Important Notes

1. **This is a TESTNET** - No real money is used
2. **Get Test MATIC** - Visit https://faucet.polygon.technology/ to get free test tokens
3. **Private Key Security** - Never share your private key or commit `.env` to Git
4. **Contract Owner** - The wallet with the private key is the contract owner (can add students)

## 🎯 Next Steps

1. ✅ Deploy contract
2. ✅ Start server
3. ✅ Open dashboard
4. ✅ Add test students
5. ✅ Mint test diplomas
6. ✅ Transfer to MetaMask

## 🆘 Need Help?

If you encounter issues:
1. Check the browser console (F12)
2. Check the server terminal for errors
3. Verify all steps were followed correctly
4. Make sure you have testnet MATIC in your wallet

## 📚 Technologies Used

- **Solidity** - Smart contract language
- **Hardhat** - Development framework
- **Node.js/Express** - Backend server
- **Ethers.js** - Blockchain interaction
- **IPFS** - Decentralized file storage
- **OpenZeppelin** - Secure contract libraries

---

**Good luck with your project! 🚀**


