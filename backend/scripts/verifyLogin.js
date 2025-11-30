const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');
require('dotenv').config();

const verifyLogin = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-server';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Get credentials from command line or use defaults
    const orgId = process.argv[2] || 'ORG1234567890ABCD';
    const username = process.argv[3] || 'pizza_admin';
    const password = process.argv[4] || 'pizza123';

    console.log('🔍 Verifying login credentials...\n');
    console.log(`OrgId: ${orgId}`);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}\n`);

    // Check if organization exists
    console.log('1️⃣ Checking organization...');
    const org = await Organization.findOne({ orgId });
    if (!org) {
      console.log('❌ Organization not found!');
      console.log(`   OrgId: ${orgId}`);
      console.log('\n💡 Available organizations:');
      const allOrgs = await Organization.find().select('orgId name email');
      if (allOrgs.length === 0) {
        console.log('   No organizations found. Create one first!');
      } else {
        allOrgs.forEach(o => {
          console.log(`   - ${o.orgId}: ${o.name} (${o.email})`);
        });
      }
      process.exit(1);
    }
    console.log(`✅ Organization found: ${org.name}`);
    console.log(`   Email: ${org.email}`);
    console.log(`   Active: ${org.isActive ? 'Yes' : 'No'}\n`);

    // Check if user exists
    console.log('2️⃣ Checking user...');
    const user = await User.findOne({ username, orgId, role: 'org_admin' }).select('+password');
    if (!user) {
      console.log('❌ User not found!');
      console.log(`   Username: ${username}`);
      console.log(`   OrgId: ${orgId}`);
      console.log(`   Role: org_admin\n`);
      
      console.log('💡 Available users for this organization:');
      const allUsers = await User.find({ orgId }).select('username role isActive');
      if (allUsers.length === 0) {
        console.log('   No users found for this organization.');
      } else {
        allUsers.forEach(u => {
          console.log(`   - ${u.username} (${u.role}) - Active: ${u.isActive ? 'Yes' : 'No'}`);
        });
      }
      process.exit(1);
    }
    console.log(`✅ User found: ${user.username}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}\n`);

    // Verify password
    console.log('3️⃣ Verifying password...');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Password does not match!');
      console.log('   The password you entered is incorrect.');
      process.exit(1);
    }
    console.log('✅ Password is correct!\n');

    // Summary
    console.log('✅✅✅ All checks passed! Login should work.\n');
    console.log('📋 Login Details:');
    console.log(`   Endpoint: POST http://localhost:5000/api/auth/org-admin/login`);
    console.log(`   Body: {`);
    console.log(`     "username": "${username}",`);
    console.log(`     "password": "${password}",`);
    console.log(`     "orgId": "${orgId}"`);
    console.log(`   }`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

verifyLogin();

