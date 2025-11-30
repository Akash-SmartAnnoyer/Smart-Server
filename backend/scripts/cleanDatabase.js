const mongoose = require('mongoose');
require('dotenv').config();

const cleanDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-server';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get all collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log('\n🗑️  Cleaning database...\n');

    // Drop all collections except keep super admin user
    for (const collection of collections) {
      const collectionName = collection.name;
      
      // Skip system collections
      if (collectionName.startsWith('system.')) {
        continue;
      }

      // For users collection, only delete non-super-admin users
      if (collectionName === 'users') {
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
        const result = await User.deleteMany({ role: { $ne: 'super_admin' } });
        console.log(`   ✅ Cleaned ${result.deletedCount} users (kept super admin)`);
      } else {
        await db.collection(collectionName).drop();
        console.log(`   ✅ Dropped collection: ${collectionName}`);
      }
    }

    console.log('\n✅ Database cleaned successfully!');
    console.log('💡 Super admin user has been preserved.');
    console.log('💡 Run "npm run create-super-admin" if you need to create a new super admin.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  }
};

cleanDatabase();

