#!/usr/bin/env node

/**
 * Clean Database Script
 * 
 * This script will:
 * 1. Connect to MongoDB Atlas
 * 2. Clear all existing school data
 * 3. Confirm database is empty
 * 4. Ready for fresh CSV import
 */

import mongoose from 'mongoose';
import School from './src/models/schoolModel.js';

// MongoDB Atlas connection
const connectionString = "mongodb+srv://ajv1520:ajmark321@schoolcluster.v1pfmoq.mongodb.net/udise-dashboard?retryWrites=true&w=majority&appName=SchoolCluster";

class DatabaseCleaner {
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

  // Check current data
  async checkCurrentData() {
    try {
      console.log('📊 Checking current database status...');
      
      const totalSchools = await School.countDocuments();
      const states = await School.distinct('state');
      
      console.log(`📈 Current Status:`);
      console.log(`   Total Schools: ${totalSchools}`);
      console.log(`   States: ${states.length}`);
      console.log(`   States: ${states.slice(0, 5).join(', ')}${states.length > 5 ? '...' : ''}`);
      
      return { totalSchools, states };
    } catch (error) {
      console.error('❌ Error checking data:', error.message);
      throw error;
    }
  }

  // Clear all school data
  async clearAllData() {
    try {
      console.log('🗑️  Clearing all school data...');
      
      const result = await School.deleteMany({});
      console.log(`✅ Deleted ${result.deletedCount} schools`);
      
      return result.deletedCount;
    } catch (error) {
      console.error('❌ Error clearing data:', error.message);
      throw error;
    }
  }

  // Verify database is empty
  async verifyEmpty() {
    try {
      console.log('🔍 Verifying database is empty...');
      
      const totalSchools = await School.countDocuments();
      const states = await School.distinct('state');
      
      if (totalSchools === 0 && states.length === 0) {
        console.log('✅ Database is completely empty');
        return true;
      } else {
        console.log(`❌ Database still has data: ${totalSchools} schools, ${states.length} states`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error verifying empty database:', error.message);
      throw error;
    }
  }

  // Main execution
  async run() {
    try {
      console.log('🚀 Starting Database Cleanup...');
      
      // Connect to database
      await this.connectToDatabase();
      
      // Check current data
      const { totalSchools, states } = await this.checkCurrentData();
      
      if (totalSchools === 0) {
        console.log('✅ Database is already empty');
        return;
      }
      
      // Clear all data
      const deletedCount = await this.clearAllData();
      
      // Verify empty
      const isEmpty = await this.verifyEmpty();
      
      if (isEmpty) {
        console.log('\n🎉 Database cleanup completed successfully!');
        console.log(`🗑️  Deleted: ${deletedCount} schools`);
        console.log('✅ Database is now empty and ready for fresh CSV import');
        console.log('\n📋 Next Steps:');
        console.log('   1. Go to MongoDB Atlas Dashboard');
        console.log('   2. Navigate to your cluster');
        console.log('   3. Click "Import Data"');
        console.log('   4. Upload schools.csv file');
        console.log('   5. Map fields to your schema');
        console.log('   6. Import all 1.6M+ records');
      } else {
        console.log('❌ Database cleanup failed - still has data');
      }
      
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
      throw error;
    } finally {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Run the cleaner
const cleaner = new DatabaseCleaner();
cleaner.run().catch(console.error);
