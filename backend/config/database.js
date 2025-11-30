const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGODB_URI_LOCAL || 'mongodb://localhost:27017/smart-server';
    
    if (!mongoURI) {
      console.warn('⚠️  MONGODB_URI not set. Using default: mongodb://localhost:27017/smart-server');
      console.warn('⚠️  Please create .env file with MONGODB_URI');
    }
    
    console.log('🔄 Connecting to MongoDB...');
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure MongoDB is running');
    console.error('   2. Check your .env file has MONGODB_URI set');
    console.error('   3. Default connection: mongodb://localhost:27017/smart-server');
    console.error('\n⚠️  Server will continue but database operations will fail until MongoDB is connected.\n');
    // Don't exit - let server start but warn user
    return null;
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

module.exports = connectDB;

