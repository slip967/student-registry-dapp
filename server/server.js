const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const dotenv = require("dotenv");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const { Blob } = require("buffer");
const { generateDiploma } = require("./diploma_generator");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', network: 'Polygon Amoy', timestamp: new Date().toISOString() });
});

// Serve static files from client directory
app.use(express.static(path.join(__dirname, "../client")));

// IPFS Configuration - Using simple hash-based approach for CommonJS compatibility
// For production, consider using Pinata API or Web3.Storage
let ipfs = null;

// Helper function to create IPFS hash (mock for now)
// Helper function to handle file upload (Store Locally for Dev / Pinata for Prod)
async function uploadToIPFS(fileBuffer, fileName, fileType) {
  try {
    // 1. Force Local Storage (Dev Mode) for reliability
    if (true || !process.env.PINATA_JWT) {
      const uploadsDir = path.join(__dirname, "../client/uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Create unique filename
      const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex").substring(0, 16);
      const ext = fileType && fileType.includes("pdf") ? ".pdf" : ".png";
      // Sanitize filename
      const safeName = (fileName || "file").replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const localFileName = `${safeName}_${hash}${ext}`;
      const localFilePath = path.join(uploadsDir, localFileName);

      // Save file locally
      fs.writeFileSync(localFilePath, fileBuffer);

      // Generate Public URL (assuming server running on localhost:3000)
      const PORT = process.env.PORT || 3000;
      const baseUrl = `http://localhost:${PORT}`;
      const fileUrl = `${baseUrl}/uploads/${localFileName}`;

      console.log(`� File saved locally: ${localFilePath}`);
      console.log(`🔗 Local URL: ${fileUrl}`);

      // If PDF, we need a preview image for the NFT "image" field
      let imageUrl = fileUrl;
      if (fileType && fileType.includes("pdf")) {
        // For PDF, use a generic PDF icon or generate a preview if possible
        // Here we'll use a placeholder or the generateDiploma logic if we had student data (but we only have file here)
        // Let's use a generic placeholder for PDF thumb if we can't generate
        imageUrl = "https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg";
      }

      const mockMetadata = {
        name: fileName || "Diploma",
        description: "Student diploma NFT (Local Dev)",
        image: imageUrl,
        external_url: fileUrl, // Link to actual file (PDF/Image)
        attributes: [
          { trait_type: "Type", value: fileType || "Document" }
        ]
      };

      // We also verify if we need to GENERATE a diploma image 
      // But this function just uploads what it's given. 

      // Return "Mock" IPFS hash that is actually just a unique ID we can track if needed, 
      // but importantly return the tokenURI as a Data URI or a local JSON endpoint?
      // MetaMask handles Data URI for tokenURI. 
      // Or we can save metadata.json locally too.

      const metaFileName = `${safeName}_${hash}.json`;
      const metaFilePath = path.join(uploadsDir, metaFileName);
      fs.writeFileSync(metaFilePath, JSON.stringify(mockMetadata, null, 2));
      const tokenURI = `${baseUrl}/uploads/${metaFileName}`;

      return { hash: hash, tokenURI: tokenURI, imageCid: hash };
    }

    // 2. Production: Use Pinata
    const fileForm = new FormData();
    fileForm.append("file", new Blob([fileBuffer], { type: fileType || "application/octet-stream" }), fileName || "diploma");
    fileForm.append("pinataMetadata", JSON.stringify({ name: fileName || "diploma" }));

    const pinFileRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`
      },
      body: fileForm
    });

    if (!pinFileRes.ok) {
      const errText = await pinFileRes.text();
      throw new Error(`Pinata pinFileToIPFS failed: ${errText}`);
    }

    const pinnedFile = await pinFileRes.json();
    const imageCid = pinnedFile.IpfsHash;
    const gatewayImageUrl = `https://gateway.pinata.cloud/ipfs/${imageCid}`;

    // Build metadata
    // FIX FOR METAMASK: Use HTTP Gateway for 'image' to ensure it loads in wallet reliably
    // Use ipfs:// for external_url as a reference
    const metadata = {
      name: fileName || "Diploma",
      description: "Student diploma NFT",
      image: gatewayImageUrl, // HTTP Link = Instant load
      external_url: `ipfs://${imageCid}`, // Standard IPFS Link
      image_data: gatewayImageUrl, // Backup
      attributes: [
        { trait_type: "Type", value: fileType || "Document" },
        { trait_type: "Storage", value: "IPFS/Pinata" }
      ]
    };

    const pinJsonRes = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: { name: `${(fileName || "diploma")}-metadata` }
      })
    });

    if (!pinJsonRes.ok) {
      throw new Error(`Pinata metadata upload failed`);
    }

    const pinnedJson = await pinJsonRes.json();
    const metadataCid = pinnedJson.IpfsHash;

    // Return the HTTP gateway for tokenURI so MetaMask fetches metadata instantly
    return { hash: metadataCid, tokenURI: `https://gateway.pinata.cloud/ipfs/${metadataCid}`, imageCid };
  } catch (error) {
    console.error("Error processing file:", error);
    throw error;
  }
}

// Blockchain Configuration
// Using public RPC by default to avoid rate limits (you can switch to Infura by setting RPC_URL in .env)
const RPC_URL = process.env.RPC_URL || (process.env.INFURA_API_KEY ? `https://polygon-amoy.infura.io/v3/${process.env.INFURA_API_KEY}` : 'https://rpc-amoy.polygon.technology');
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; // Set after deployment

console.log("📡 Using RPC:", RPC_URL.includes('infura') ? 'Infura' : 'Public Polygon RPC');

// Initialize provider and signer
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Contract ABI (minimal - add more functions as needed)
const CONTRACT_ABI = [
  "function addStudent(uint256 _id, string memory _name, string memory _course, string memory _dateOfBirth, uint256 _averageGrade, string memory _status) public",
  "function getStudent(uint256 _id) public view returns (uint256 id, string memory name, string memory course, string memory dateOfBirth, uint256 averageGrade, string memory status, bool isEnrolled, uint256 diplomaTokenId)",
  "function getTotalStudents() public view returns (uint256)",
  "function getAllStudentIds() public view returns (uint256[])",
  "function mintDiploma(uint256 _studentId, string memory _tokenURI) public",
  "function transferDiplomaToStudent(uint256 _tokenId, address _studentAddress) public",
  "function owner() public view returns (address)",
  "event StudentAdded(uint256 indexed studentId, string name, string course)",
  "event DiplomaMinted(uint256 indexed tokenId, uint256 indexed studentId, string tokenURI)"
];

let contract;

// Initialize contract connection
if (CONTRACT_ADDRESS) {
  contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
  console.log("✅ Connected to contract at:", CONTRACT_ADDRESS);
} else {
  console.log("⚠️  CONTRACT_ADDRESS not set in .env - please deploy contract first");
}

// Routes

// Serve dashboard as homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dashboard.html"));
});

// Health check API endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "Server is running",
    network: "Polygon Amoy",
    contractAddress: CONTRACT_ADDRESS || "Not deployed"
  });
});

// Add student
app.post("/add-student", async (req, res) => {
  try {
    const { id, name, course, dateOfBirth, averageGrade, status } = req.body;

    if (!id || !name || !course || !dateOfBirth || averageGrade === undefined || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!contract) {
      return res.status(500).json({ error: "Contract not initialized" });
    }

    console.log(`Adding student: ${name} (ID: ${id})`);

    const tx = await contract.addStudent(
      id,
      name,
      course,
      dateOfBirth,
      averageGrade,
      status
    );

    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed:", receipt.hash);

    res.json({
      success: true,
      txHash: receipt.hash,
      studentId: id,
      message: "Student added successfully"
    });
  } catch (error) {
    console.error("Error adding student:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      reason: error.reason,
      data: error.data
    });

    // Check for rate limit errors
    let errorMessage = error.message;
    let statusCode = 500;

    if (error.message.includes('Too Many Requests') ||
      error.message.includes('-32005') ||
      (error.code === 'BAD_DATA' && error.message && error.message.includes('Too Many Requests'))) {
      errorMessage = "Rate limit exceeded. Please wait a few minutes and try again, or use a different RPC endpoint.";
      statusCode = 429; // Too Many Requests
    }

    res.status(statusCode).json({
      error: "Failed to add student",
      message: errorMessage,
      reason: error.reason || error.code || "Unknown error",
      details: error.data || null
    });
  }
});

// Get all students
app.get("/students", async (req, res) => {
  try {
    if (!contract) {
      return res.status(500).json({ error: "Contract not initialized" });
    }

    const studentIds = await contract.getAllStudentIds();
    const students = [];

    for (const id of studentIds) {
      const student = await contract.getStudent(id);
      students.push({
        id: student.id.toString(),
        name: student.name,
        course: student.course,
        dateOfBirth: student.dateOfBirth,
        averageGrade: student.averageGrade.toString(),
        status: student.status,
        isEnrolled: student.isEnrolled,
        diplomaTokenId: student.diplomaTokenId.toString()
      });
    }

    res.json({ students, total: students.length });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      error: "Failed to fetch students",
      message: error.message
    });
  }
});

// Get single student
app.get("/student/:id", async (req, res) => {
  try {
    const studentId = req.params.id;

    if (!contract) {
      return res.status(500).json({ error: "Contract not initialized" });
    }

    const student = await contract.getStudent(studentId);

    if (student.id.toString() === "0") {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({
      id: student.id.toString(),
      name: student.name,
      course: student.course,
      dateOfBirth: student.dateOfBirth,
      averageGrade: student.averageGrade.toString(),
      status: student.status,
      isEnrolled: student.isEnrolled,
      diplomaTokenId: student.diplomaTokenId.toString()
    });
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({
      error: "Failed to fetch student",
      message: error.message
    });
  }
});

// Upload file to IPFS and mint diploma NFT
app.post("/mint-diploma", async (req, res) => {
  try {
    const { studentId, fileData, fileName, fileType, recipientAddress } = req.body;

    console.log("Mint diploma request:", {
      studentId,
      hasFileData: !!fileData,
      fileName,
      fileType,
      recipientAddress
    });

    // Validate studentId - can be number or string that converts to number
    const studentIdNum = typeof studentId === 'string' ? parseInt(studentId) : studentId;

    if (!studentIdNum || isNaN(studentIdNum) || studentIdNum <= 0) {
      return res.status(400).json({
        error: "Missing or invalid studentId",
        received: req.body,
        studentId: studentId,
        studentIdNum: studentIdNum
      });
    }

    if (!contract) {
      return res.status(500).json({ error: "Contract not initialized" });
    }

    console.log(`Minting diploma for student ID: ${studentIdNum}`);
    console.log(`File provided: ${!!fileData}, Recipient: ${recipientAddress || 'none'}`);

    let tokenURI;
    let ipfsHash = null;

    // If file is provided, upload it
    // Check if fileData is actually provided (not null, not empty string, not the string "null")
    const hasValidFileData = fileData &&
      fileData !== 'null' &&
      fileData !== null &&
      typeof fileData === 'string' &&
      fileData.trim() !== '' &&
      !fileData.startsWith('null');

    if (hasValidFileData) {
      try {
        // Convert base64 to buffer
        const base64Data = fileData.split(",")[1] || fileData;
        const fileBuffer = Buffer.from(base64Data, "base64");
        // Upload to IPFS (using helper function)
        const ipfsResult = await uploadToIPFS(fileBuffer, fileName || "diploma", fileType);
        tokenURI = ipfsResult.tokenURI;
        ipfsHash = ipfsResult.hash;
        // Ensure metadata includes image/pdf link for MetaMask
        // If using Pinata, metadata already has image field
        // If mock, create metadata JSON and upload to IPFS (not implemented in mock)
        console.log("✅ File uploaded to IPFS:", tokenURI);
      } catch (fileError) {
        console.error("Error processing file, using default:", fileError);
        // Fallback to default if file processing fails
        const defaultHash = crypto.createHash("sha256")
          .update(`diploma_${studentId}_${Date.now()}`)
          .digest("hex")
          .substring(0, 44);
        tokenURI = `https://gateway.pinata.cloud/ipfs/Qm${defaultHash}`;
        ipfsHash = defaultHash;
      }
    } else {
      // NO File Provided: GENERATE a Diploma Image using student data
      console.log(" Generating diploma image for student:", studentIdNum);

      let studentData = { id: studentIdNum, name: "Student", course: "-", dateOfBirth: "-", status: "Active", averageGrade: "0" };
      try {
        studentData = await contract.getStudent(studentIdNum);
      } catch (e) { console.warn("Could not fetch student data for generation", e); }

      // Generate the image buffer
      const generatedBuffer = await generateDiploma({
        id: studentData.id.toString(),
        name: studentData.name,
        course: studentData.course,
        dateOfBirth: studentData.dateOfBirth,
        status: studentData.status,
        averageGrade: studentData.averageGrade.toString()
      });

      // Use our modified uploadToIPFS to save this generated image locally
      const uploadRes = await uploadToIPFS(generatedBuffer, `diploma_${studentIdNum}`, "image/jpeg");
      tokenURI = uploadRes.tokenURI;
      ipfsHash = uploadRes.hash;
      console.log("✅ Generated and saved diploma:", tokenURI);
    }
    // Mint NFT to contract owner first
    console.log(`Attempting to mint diploma for student ${studentIdNum} with URI: ${tokenURI}`);
    const mintTx = await contract.mintDiploma(studentIdNum, tokenURI);
    console.log("Mint transaction sent:", mintTx.hash);

    const mintReceipt = await mintTx.wait();
    console.log("Mint transaction confirmed:", mintReceipt.hash);
    console.log("Receipt logs:", mintReceipt.logs.length);

    // Get token ID from event
    const diplomaMintedTopic = ethers.id("DiplomaMinted(uint256,uint256,string)");
    console.log("Looking for event with topic:", diplomaMintedTopic);

    const mintEvent = mintReceipt.logs.find(
      log => log.topics[0] === diplomaMintedTopic
    );

    let tokenId = null;
    if (mintEvent) {
      console.log("Found mint event:", mintEvent);
      // Event signature: DiplomaMinted(uint256 indexed tokenId, uint256 indexed studentId, string tokenURI)
      // topics[0] = event signature
      // topics[1] = tokenId (indexed)
      // topics[2] = studentId (indexed)
      tokenId = BigInt(mintEvent.topics[1]).toString();
      console.log("Extracted token ID:", tokenId);
    } else {
      console.warn("⚠️  Mint event not found in logs. Checking all events...");
      mintReceipt.logs.forEach((log, index) => {
        console.log(`Log ${index}:`, {
          topics: log.topics,
          data: log.data
        });
      });
      // Try to get token ID from contract state as fallback
      // This is a workaround if event parsing fails
    }

    if (!tokenId) {
      console.warn("⚠️  Could not extract token ID from event. Using fallback method.");
      // Fallback: query the contract for the student's diploma token ID
      try {
        const student = await contract.getStudent(studentIdNum);
        tokenId = student.diplomaTokenId.toString();
        console.log("Got token ID from contract state:", tokenId);
      } catch (queryError) {
        console.error("Error querying contract for token ID:", queryError);
        throw new Error("Could not determine token ID after minting");
      }
    }

    console.log("✅ Diploma NFT minted with Token ID:", tokenId);

    // If recipient address is provided, transfer immediately
    let transferTxHash = null;
    if (recipientAddress && ethers.isAddress(recipientAddress)) {
      try {
        console.log(`Transferring diploma ${tokenId} to ${recipientAddress}`);
        const transferTx = await contract.transferDiplomaToStudent(tokenId, recipientAddress);
        const transferReceipt = await transferTx.wait();
        transferTxHash = transferReceipt.hash;
        console.log("✅ Diploma transferred to user:", transferTxHash);
      } catch (transferError) {
        console.error("Error transferring diploma:", transferError);
        // Continue anyway - NFT is minted, user can transfer manually later
      }
    }

    res.json({
      success: true,
      txHash: mintReceipt.hash,
      tokenId: tokenId,
      ipfsHash: ipfsHash,
      tokenURI: tokenURI,
      contractAddress: CONTRACT_ADDRESS,
      transferred: !!transferTxHash,
      transferTxHash: transferTxHash,
      recipientAddress: recipientAddress,
      message: transferTxHash ? "Diploma minted and transferred successfully" : "Diploma minted successfully"
    });
  } catch (error) {
    console.error("Error minting diploma:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      reason: error.reason,
      data: error.data,
      stack: error.stack
    });
    res.status(500).json({
      error: "Failed to mint diploma",
      message: error.message,
      reason: error.reason || error.code || "Unknown error",
      details: error.data || null
    });
  }
});

// Transfer diploma to student
app.post("/transfer-diploma", async (req, res) => {
  try {
    const { tokenId, studentAddress } = req.body;

    if (!tokenId || !studentAddress) {
      return res.status(400).json({ error: "Missing tokenId or studentAddress" });
    }

    if (!contract) {
      return res.status(500).json({ error: "Contract not initialized" });
    }

    if (!ethers.isAddress(studentAddress)) {
      return res.status(400).json({ error: "Invalid Ethereum address" });
    }

    console.log(`Transferring diploma ${tokenId} to ${studentAddress}`);

    const tx = await contract.transferDiplomaToStudent(tokenId, studentAddress);
    const receipt = await tx.wait();

    console.log("✅ Diploma transferred:", receipt.hash);

    res.json({
      success: true,
      txHash: receipt.hash,
      tokenId: tokenId,
      studentAddress: studentAddress,
      message: "Diploma transferred successfully"
    });
  } catch (error) {
    console.error("Error transferring diploma:", error);
    res.status(500).json({
      error: "Failed to transfer diploma",
      message: error.message
    });
  }
});

// Get statistics
app.get("/stats", async (req, res) => {
  try {
    if (!contract) {
      return res.status(500).json({ error: "Contract not initialized" });
    }

    const totalStudents = await contract.getTotalStudents();
    const studentIds = await contract.getAllStudentIds();

    let enrolledCount = 0;
    let graduatedCount = 0;
    let withDiplomaCount = 0;

    for (const id of studentIds) {
      const student = await contract.getStudent(id);
      if (student.isEnrolled) enrolledCount++;
      if (student.status === "Graduated") graduatedCount++;
      if (student.diplomaTokenId.toString() !== "0") withDiplomaCount++;
    }

    res.json({
      totalStudents: totalStudents.toString(),
      enrolledCount,
      graduatedCount,
      withDiplomaCount,
      network: "Polygon Amoy"
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      error: "Failed to fetch statistics",
      message: error.message
    });
  }
});

// Debug route for generation
app.get("/test-gen", async (req, res) => {
  try {
    const buffer = await generateDiploma({
      id: "123", name: "Test Student", course: "Debug Course",
      dateOfBirth: "01/01/2000", status: "Active", averageGrade: "99"
    });
    console.log("Debug Gen Success, buffer length:", buffer.length);
    res.set("Content-Type", "image/jpeg");
    res.send(buffer);
  } catch (e) {
    console.error("Debug Gen Failed:", e);
    res.status(500).send(String(e));
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT} (WITH LOCAL UPLOADS FIX v2)`);
  console.log(`📡 Network: Polygon Amoy Testnet`);
  if (CONTRACT_ADDRESS) {
    console.log(`📄 Contract: ${CONTRACT_ADDRESS}`);
  }
});

