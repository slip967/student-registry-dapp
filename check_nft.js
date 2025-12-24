const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
const contract = new ethers.Contract('0x0955E398C008089dE3515799F294711ca4cF0E33', [
  'event DiplomaMinted(uint256 indexed tokenId, uint256 indexed studentId, string tokenURI)',
  'function totalSupply() view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)'
], provider);

async function checkNFTs() {
  try {
    const total = await contract.totalSupply();
    console.log('Total NFTs:', total.toString());
    
    for(let i = 1; i <= total && i <= 10; i++) {
      try {
        const uri = await contract.tokenURI(i);
        console.log(`Token ${i} URI: ${uri}`);
        
        // If it's an IPFS URI, try to fetch the metadata
        if (uri.startsWith('ipfs://')) {
          const cid = uri.replace('ipfs://', '');
          const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
          console.log(`  Metadata URL: ${gatewayUrl}`);
          
          try {
            const response = await fetch(gatewayUrl);
            const metadata = await response.json();
            console.log('  Metadata:', JSON.stringify(metadata, null, 2));
            
            // Check if this metadata references your image CID
            if (metadata.image && metadata.image.includes('bafybeiaqabqipwxfegofth6dv76xhtuykerr2ejkpqueu2cxgr2rlhc7wu')) {
              console.log('  *** FOUND METADATA THAT REFERENCES YOUR IMAGE CID ***');
            }
          } catch (metaError) {
            console.log('  Error fetching metadata:', metaError.message);
          }
        }
      } catch(e) {
        console.log(`Token ${i}: Error - ${e.message}`);
      }
    }
  } catch(e) {
    console.log('Error:', e.message);
  }
}

checkNFTs();
