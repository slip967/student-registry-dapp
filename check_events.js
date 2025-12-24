const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
const contract = new ethers.Contract('0x0955E398C008089dE3515799F294711ca4cF0E33', [
  'event DiplomaMinted(uint256 indexed tokenId, uint256 indexed studentId, string tokenURI)',
  'event StudentAdded(uint256 indexed studentId, string name, string course)',
  'function getAllStudentIds() view returns (uint256[])',
  'function getStudent(uint256 _id) view returns (uint256 id, string memory name, string memory course, string memory dateOfBirth, uint256 averageGrade, string memory status, bool isEnrolled, uint256 diplomaTokenId)'
], provider);

async function checkEvents() {
  try {
    console.log('Checking recent DiplomaMinted events...');
    
    // Get recent events
    const filter = contract.filters.DiplomaMinted();
    const events = await contract.queryFilter(filter, -1000); // Last 1000 blocks
    
    console.log(`Found ${events.length} DiplomaMinted events:`);
    
    for (const event of events) {
      console.log(`\nEvent at block ${event.blockNumber}:`);
      console.log(`  Token ID: ${event.args.tokenId}`);
      console.log(`  Student ID: ${event.args.studentId}`);
      console.log(`  Token URI: ${event.args.tokenURI}`);
      
      // If it's an IPFS URI, try to fetch the metadata
      if (event.args.tokenURI && event.args.tokenURI.startsWith('ipfs://')) {
        const cid = event.args.tokenURI.replace('ipfs://', '');
        const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
        console.log(`  Metadata URL: ${gatewayUrl}`);
        
        try {
          const response = await fetch(gatewayUrl);
          const metadata = await response.json();
          console.log('  Metadata:', JSON.stringify(metadata, null, 2));
          
          // Check if this metadata references your image CID
          if (metadata.image && metadata.image.includes('bafybeiaqabqipwxfegofth6dv76xhtuykerr2ejkpqueu2cxgr2rlhc7wu')) {
            console.log('  *** FOUND METADATA THAT REFERENCES YOUR IMAGE CID ***');
            console.log(`  *** METADATA CID: ${cid} ***`);
          }
        } catch (metaError) {
          console.log('  Error fetching metadata:', metaError.message);
        }
      }
    }
    
    if (events.length === 0) {
      console.log('No DiplomaMinted events found. Checking students...');
      
      try {
        const studentIds = await contract.getAllStudentIds();
        console.log(`Found ${studentIds.length} students`);
        
        for (const id of studentIds.slice(0, 5)) { // Check first 5 students
          try {
            const student = await contract.getStudent(id);
            if (student.diplomaTokenId.toString() !== "0") {
              console.log(`\nStudent ${id}:`);
              console.log(`  Name: ${student.name}`);
              console.log(`  Diploma Token ID: ${student.diplomaTokenId}`);
            }
          } catch(e) {
            console.log(`Error checking student ${id}:`, e.message);
          }
        }
      } catch(studentError) {
        console.log('Error getting students:', studentError.message);
      }
    }
    
  } catch(e) {
    console.log('Error:', e.message);
  }
}

checkEvents();
