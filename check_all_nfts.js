const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider('https://rpc-amoy.polygon.technology');
const contract = new ethers.Contract('0x0955E398C008089dE3515799F294711ca4cF0E33', [
  'event DiplomaMinted(uint256 indexed tokenId, uint256 indexed studentId, string tokenURI)'
], provider);

async function checkAll() {
  const filter = contract.filters.DiplomaMinted();
  const events = await contract.queryFilter(filter, -1000);
  console.log(`Found ${events.length} NFTs:`);
  
  for(const event of events) {
    console.log(`Token ${event.args.tokenId}: ${event.args.tokenURI}`);
  }
}

checkAll().catch(console.log);
