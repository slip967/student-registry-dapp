// Helper script to create .env file
const fs = require('fs');
const path = require('path');

const envContent = `INFURA_API_KEY=0d18f0546cc143b39ce1d9d05646772b
PRIVATE_KEY=928f6d205c82c514d75fa588c71ee3101976c57ea6ae44bcf29c23a9f7690d9c
CONTRACT_ADDRESS=
PORT=3000
`;

const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('📝 Remember to add CONTRACT_ADDRESS after deployment');
} else {
  console.log('⚠️  .env file already exists');
  console.log('📝 If you need to recreate it, delete it first');
}


