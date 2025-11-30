const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-server';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Check if super admin already exists
    const existingAdmin = await User.findOne({ role: 'super_admin' });
    if (existingAdmin) {
      console.log('⚠️  Super admin already exists');
      console.log(`   Username: ${existingAdmin.username}`);
      process.exit(0);
    }

    // Create super admin
    const superAdmin = new User({
      username: process.env.SUPER_ADMIN_USERNAME || 'superadmin',
      password: process.env.SUPER_ADMIN_PASSWORD || 'admin123',
      role: 'super_admin',
      name: 'Super Admin',
      isActive: true
    });

    await superAdmin.save();

    console.log('✅ Super admin created successfully!');
    console.log(`   Username: ${superAdmin.username}`);
    console.log(`   Password: ${process.env.SUPER_ADMIN_PASSWORD || 'admin123'}`);
    console.log('\n⚠️  Please change the default password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();

