#!/usr/bin/env node

/**
 * Setup Indexes Script
 * 
 * This script will:
 * 1. Connect to MongoDB Atlas
 * 2. Create performance indexes
 * 3. Test the filtering system
 * 4. Verify all states are imported
 */

import mongoose from 'mongoose';
import School from './src/models/schoolModel.js';

// MongoDB Atlas connection
const connectionString = "mongodb+srv://ajv1520:ajmark321@schoolcluster.v1pfmoq.mongodb.net/udise-dashboard?retryWrites=true&w=majority&appName=SchoolCluster";

class IndexSetup {
  constructor() {
    this.connectionString = connectionString;
  }

  // Connect to MongoDB
  async connectToDatabase() {
    try {
      console.log('🔗 Connecting to MongoDB Atlas...');
      await mongoose.connect(this.connectionString);
      console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  }

  // Check imported data
  async checkImportedData() {
    try {
      console.log('📊 Checking imported data...');
      
      const totalSchools = await School.countDocuments();
      const states = await School.distinct('state');
      const districts = await School.distinct('district');
      const blocks = await School.distinct('block');
      const villages = await School.distinct('village');
      
      console.log(`📈 Imported Data Status:`);
      console.log(`   Total Schools: ${totalSchools.toLocaleString()}`);
      console.log(`   States: ${states.length}`);
      console.log(`   Districts: ${districts.length}`);
      console.log(`   Blocks: ${blocks.length}`);
      console.log(`   Villages: ${villages.length}`);
      
      console.log(`\n📍 States Found:`);
      states.slice(0, 10).forEach((state, index) => {
        console.log(`   ${index + 1}. ${state}`);
      });
      if (states.length > 10) {
        console.log(`   ... and ${states.length - 10} more states`);
      }
      
      return { totalSchools, states, districts, blocks, villages };
    } catch (error) {
      console.error('❌ Error checking data:', error.message);
      throw error;
    }
  }

  // Create performance indexes
  async createIndexes() {
    try {
      console.log('🔧 Creating performance indexes...');
      
      // State index
      await School.collection.createIndex({ state: 1 });
      console.log('✅ Created state index');
      
      // District index
      await School.collection.createIndex({ district: 1 });
      console.log('✅ Created district index');
      
      // Block index
      await School.collection.createIndex({ block: 1 });
      console.log('✅ Created block index');
      
      // Village index
      await School.collection.createIndex({ village: 1 });
      console.log('✅ Created village index');
      
      // Management type index
      await School.collection.createIndex({ management_type: 1 });
      console.log('✅ Created management_type index');
      
      // Location index
      await School.collection.createIndex({ location: 1 });
      console.log('✅ Created location index');
      
      // School type index
      await School.collection.createIndex({ school_type: 1 });
      console.log('✅ Created school_type index');
      
      // UDISE code unique index
      await School.collection.createIndex({ udise_code: 1 }, { unique: true });
      console.log('✅ Created udise_code unique index');
      
      // Compound indexes for better performance
      await School.collection.createIndex({ state: 1, district: 1 });
      console.log('✅ Created state-district compound index');
      
      await School.collection.createIndex({ state: 1, district: 1, block: 1 });
      console.log('✅ Created state-district-block compound index');
      
      await School.collection.createIndex({ state: 1, district: 1, block: 1, village: 1 });
      console.log('✅ Created state-district-block-village compound index');
      
      console.log('✅ All indexes created successfully');
      
    } catch (error) {
      console.error('❌ Error creating indexes:', error.message);
      throw error;
    }
  }

  // Test filtering system
  async testFiltering() {
    try {
      console.log('🔍 Testing filtering system...');
      
      // Test states
      const states = await School.distinct('state');
      console.log(`📍 Total states: ${states.length}`);
      
      // Test districts for first state
      const firstState = states[0];
      const districts = await School.distinct('district', { state: firstState });
      console.log(`📍 Districts in ${firstState}: ${districts.length}`);
      
      // Test blocks for first district
      const firstDistrict = districts[0];
      const blocks = await School.distinct('block', { state: firstState, district: firstDistrict });
      console.log(`📍 Blocks in ${firstState} > ${firstDistrict}: ${blocks.length}`);
      
      // Test villages for first block
      const firstBlock = blocks[0];
      const villages = await School.distinct('village', { 
        state: firstState, 
        district: firstDistrict, 
        block: firstBlock 
      });
      console.log(`📍 Villages in ${firstState} > ${firstDistrict} > ${firstBlock}: ${villages.length}`);
      
      // Test schools for first village
      const firstVillage = villages[0];
      const schools = await School.countDocuments({ 
        state: firstState, 
        district: firstDistrict, 
        block: firstBlock, 
        village: firstVillage 
      });
      console.log(`📍 Schools in ${firstState} > ${firstDistrict} > ${firstBlock} > ${firstVillage}: ${schools}`);
      
      // Test management type distribution
      const mgmtDistribution = await School.aggregate([
        { $group: { _id: '$management_type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      console.log('\n📈 Management Type Distribution:');
      mgmtDistribution.forEach(item => {
        console.log(`   ${item._id}: ${item.count.toLocaleString()}`);
      });
      
      console.log('✅ Filtering system working correctly!');
      
    } catch (error) {
      console.error('❌ Error testing filtering:', error.message);
    }
  }

  // Main execution
  async run() {
    try {
      console.log('🚀 Starting Index Setup...');
      
      // Connect to database
      await this.connectToDatabase();
      
      // Check imported data
      const { totalSchools, states, districts, blocks, villages } = await this.checkImportedData();
      
      if (totalSchools === 0) {
        console.log('❌ No data found. Please import CSV first.');
        return;
      }
      
      // Create indexes
      await this.createIndexes();
      
      // Test filtering
      await this.testFiltering();
      
      console.log('\n🎉 Index setup completed successfully!');
      console.log(`📊 Database Status:`);
      console.log(`   Total Schools: ${totalSchools.toLocaleString()}`);
      console.log(`   States: ${states.length}`);
      console.log(`   Districts: ${districts.length}`);
      console.log(`   Blocks: ${blocks.length}`);
      console.log(`   Villages: ${villages.length}`);
      console.log('✅ Ready for testing with complete India data!');
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      throw error;
    } finally {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Run the setup
const setup = new IndexSetup();
setup.run().catch(console.error);
