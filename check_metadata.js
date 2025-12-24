const https = require('https');

// Try different gateways
const gateways = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/'
];

const metadataCids = [
  'Qme6dd948bbd2bac6314d6c5dfba6596504b8832074886',
  'Qmf69d53634b9b0cb33dcc9d14d629de7508de22baa924'
];

async function checkMetadata(cid) {
  console.log(`\nChecking metadata CID: ${cid}`);
  
  for (const gateway of gateways) {
    const url = gateway + cid;
    console.log(`  Trying: ${url}`);
    
    try {
      const response = await fetch(url);
      const text = await response.text();
      
      console.log(`  Status: ${response.status}`);
      console.log(`  Content type: ${response.headers.get('content-type')}`);
      
      if (response.ok) {
        try {
          const metadata = JSON.parse(text);
          console.log('  ✓ Metadata found:', JSON.stringify(metadata, null, 2));
          
          // Check if this metadata references your image CID
          if (metadata.image && metadata.image.includes('bafybeiaqabqipwxfegofth6dv76xhtuykerr2ejkpqueu2cxgr2rlhc7wu')) {
            console.log('  *** FOUND METADATA THAT REFERENCES YOUR IMAGE CID ***');
            console.log(`  *** THIS IS THE METADATA CID YOU NEED: ${cid} ***`);
            return cid;
          }
        } catch (parseError) {
          console.log('  Response (first 200 chars):', text.substring(0, 200));
        }
      } else {
        console.log('  Error response:', text.substring(0, 100));
      }
    } catch (error) {
      console.log('  Network error:', error.message);
    }
  }
  
  return null;
}

async function checkAll() {
  console.log('Checking all metadata CIDs for your image reference...');
  
  for (const cid of metadataCids) {
    const result = await checkMetadata(cid);
    if (result) {
      console.log(`\n*** SUCCESS: Found metadata CID ${result} that references your image! ***`);
      return result;
    }
  }
  
  console.log('\nNo metadata found that references your image CID.');
  console.log('Your image CID might be from a different minting session, or the metadata might be using a different format.');
}

checkAll();
