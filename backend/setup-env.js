const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
  console.log('📝 If you need to recreate it, delete .env first');
  process.exit(0);
}

// Check if .env.example exists
if (!fs.existsSync(envExamplePath)) {
  console.error('❌ .env.example file not found');
  process.exit(1);
}

// Read .env.example
const envExample = fs.readFileSync(envExamplePath, 'utf8');

// Create .env from .env.example
fs.writeFileSync(envPath, envExample);

console.log('✅ Created .env file from .env.example');
console.log('📝 Please edit .env file and configure:');
console.log('   - MONGODB_URI (default: mongodb://localhost:27017/smart-server)');
console.log('   - PORT (default: 5000)');
console.log('');

