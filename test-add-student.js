// Quick test script to check wallet balance and try adding a student
const { ethers } = require("ethers");
const dotenv = require("dotenv");

dotenv.config();

const RPC_URL = `https://polygon-amoy.infura.io/v3/${process.env.INFURA_API_KEY}`;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

async function test() {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    console.log("Wallet Address:", wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    const balanceInMatic = ethers.formatEther(balance);
    console.log("Balance:", balanceInMatic, "MATIC");
    
    if (parseFloat(balanceInMatic) < 0.01) {
      console.log("⚠️  WARNING: Low balance! Get MATIC from faucet:");
      console.log("https://faucet.polygon.technology/");
    }
    
    // Check contract
    if (CONTRACT_ADDRESS) {
      console.log("Contract Address:", CONTRACT_ADDRESS);
      const code = await provider.getCode(CONTRACT_ADDRESS);
      if (code === "0x") {
        console.log("❌ Contract not deployed at this address!");
      } else {
        console.log("✅ Contract is deployed");
      }
    } else {
      console.log("❌ CONTRACT_ADDRESS not set in .env");
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

test();


