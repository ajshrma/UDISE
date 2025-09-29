#!/usr/bin/env node

/**
 * Create Test User Script
 * 
 * This script creates a test user for authentication testing
 */

import mongoose from 'mongoose';
import User from './src/models/userModel.js';

// MongoDB Atlas connection
const connectionString = "mongodb+srv://ajv1520:ajmark321@schoolcluster.v1pfmoq.mongodb.net/udise-dashboard?retryWrites=true&w=majority&appName=SchoolCluster";

async function createTestUser() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB Atlas');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'a@a.com' });
    if (existingUser) {
      console.log('✅ Test user already exists');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Name: ${existingUser.name}`);
      return;
    }

    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'a@a.com',
      password: '12345678',
      isVerified: true
    });

    await testUser.save();
    console.log('✅ Test user created successfully');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Name: ${testUser.name}`);

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createTestUser();
