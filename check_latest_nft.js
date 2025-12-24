const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
const contract = new ethers.Contract('0x0955E398C008089dE3515799F294711ca4cF0E33', [
  'event DiplomaMinted(uint256 indexed tokenId, uint256 indexed studentId, string tokenURI)',
  'function tokenURI(uint256 tokenId) view returns (string)'
], provider);

async function checkLatestNFT() {
  try {
    console.log('Checking latest DiplomaMinted events...');
    
    // Get the most recent event
    const filter = contract.filters.DiplomaMinted();
    const events = await contract.queryFilter(filter, -10); // Last 10 blocks
    
    if (events.length === 0) {
      console.log('No recent events found');
      return;
    }
    
    // Get the latest event
    const latestEvent = events[events.length - 1];
    console.log(`\nLatest NFT (Token ID: ${latestEvent.args.tokenId}):`);
    console.log(`Student ID: ${latestEvent.args.studentId}`);
    console.log(`Token URI: ${latestEvent.args.tokenURI}`);
    
    // Check the metadata
    if (latestEvent.args.tokenURI && latestEvent.args.tokenURI.startsWith('ipfs://')) {
      const cid = latestEvent.args.tokenURI.replace('ipfs://', '');
      const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
      console.log(`\nMetadata URL: ${gatewayUrl}`);
      
      try {
        const response = await fetch(gatewayUrl);
        const metadata = await response.json();
        console.log('\nMetadata content:');
        console.log(JSON.stringify(metadata, null, 2));
        
        // Check image fields
        if (metadata.image) {
          console.log(`\nImage URL: ${metadata.image}`);
          
          // Test if image is accessible
          try {
            const imageResponse = await fetch(metadata.image, { method: 'HEAD' });
            console.log(`Image accessible: ${imageResponse.ok} (${imageResponse.status})`);
            if (imageResponse.headers.get('content-type')) {
              console.log(`Content type: ${imageResponse.headers.get('content-type')}`);
            }
          } catch (imgError) {
            console.log(`Image error: ${imgError.message}`);
          }
        }
        
        if (metadata.image_url) {
          console.log(`Image URL (alternative): ${metadata.image_url}`);
        }
        
      } catch (metaError) {
        console.log(`Error fetching metadata: ${metaError.message}`);
      }
    }
    
  } catch (e) {
    console.log('Error:', e.message);
  }
}

checkLatestNFT();
