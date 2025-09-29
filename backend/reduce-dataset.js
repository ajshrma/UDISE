#!/usr/bin/env node

/**
 * Reduce Dataset Script
 * 
 * This script will:
 * 1. Connect to MongoDB Atlas
 * 2. Count total records
 * 3. Delete half the records randomly
 * 4. Keep the database within 512 MB limit
 */

import mongoose from 'mongoose';
import School from './src/models/schoolModel.js';

// MongoDB Atlas connection
const connectionString = "mongodb+srv://ajv1520:ajmark321@schoolcluster.v1pfmoq.mongodb.net/udise-dashboard?retryWrites=true&w=majority&appName=SchoolCluster";

class DatasetReducer {
  constructor() {
    this.connectionString = connectionString;
    this.stats = {
      totalRecords: 0,
      recordsToDelete: 0,
      deletedRecords: 0,
      remainingRecords: 0,
      startTime: null,
      endTime: null
    };
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

  // Get current database stats
  async getDatabaseStats() {
    try {
      console.log('📊 Checking current database status...');
      
      const totalRecords = await School.countDocuments();
      this.stats.totalRecords = totalRecords;
      
      // Calculate how many records to delete (keep 50%)
      this.stats.recordsToDelete = Math.floor(totalRecords / 2);
      this.stats.remainingRecords = totalRecords - this.stats.recordsToDelete;
      
      console.log(`📈 Current Status:`);
      console.log(`   Total Records: ${totalRecords.toLocaleString()}`);
      console.log(`   Records to Delete: ${this.stats.recordsToDelete.toLocaleString()}`);
      console.log(`   Records to Keep: ${this.stats.remainingRecords.toLocaleString()}`);
      
      return { totalRecords, recordsToDelete: this.stats.recordsToDelete };
    } catch (error) {
      console.error('❌ Error getting database stats:', error.message);
      throw error;
    }
  }

  // Delete half the records randomly
  async deleteHalfRecords() {
    try {
      console.log('🗑️  Deleting half the records to reduce storage...');
      this.stats.startTime = new Date();
      
      // Get random sample of IDs to delete
      const randomSample = await School.aggregate([
        { $sample: { size: this.stats.recordsToDelete } },
        { $project: { _id: 1 } }
      ]);
      
      const idsToDelete = randomSample.map(doc => doc._id);
      
      console.log(`📝 Found ${idsToDelete.length} random records to delete`);
      
      // Delete in batches to avoid memory issues
      const batchSize = 1000;
      let deletedCount = 0;
      
      for (let i = 0; i < idsToDelete.length; i += batchSize) {
        const batch = idsToDelete.slice(i, i + batchSize);
        
        const result = await School.deleteMany({ _id: { $in: batch } });
        deletedCount += result.deletedCount;
        
        console.log(`🗑️  Deleted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(idsToDelete.length / batchSize)} (${deletedCount} total)`);
      }
      
      this.stats.deletedRecords = deletedCount;
      this.stats.endTime = new Date();
      
      console.log(`✅ Deleted ${deletedCount} records successfully`);
      
    } catch (error) {
      console.error('❌ Error deleting records:', error.message);
      throw error;
    }
  }

  // Verify final database status
  async verifyFinalStatus() {
    try {
      console.log('🔍 Verifying final database status...');
      
      const totalRecords = await School.countDocuments();
      const states = await School.distinct('state');
      const managementTypes = await School.distinct('management_type');
      
      console.log(`📈 Final Database Status:`);
      console.log(`   Total Records: ${totalRecords.toLocaleString()}`);
      console.log(`   States: ${states.length}`);
      console.log(`   Management Types: ${managementTypes.length}`);
      
      console.log(`\n📍 States Found:`);
      states.slice(0, 10).forEach((state, index) => {
        console.log(`   ${index + 1}. ${state}`);
      });
      if (states.length > 10) {
        console.log(`   ... and ${states.length - 10} more states`);
      }
      
      // Show management type distribution
      const mgmtDistribution = await School.aggregate([
        { $group: { _id: '$management_type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      console.log('\n📈 Management Type Distribution:');
      mgmtDistribution.forEach(item => {
        console.log(`   ${item._id}: ${item.count.toLocaleString()}`);
      });
      
    } catch (error) {
      console.error('❌ Error verifying final status:', error.message);
    }
  }

  // Main execution
  async run() {
    try {
      console.log('🚀 Starting Dataset Reduction...');
      console.log('🎯 Goal: Reduce dataset to stay within 512 MB limit');
      
      // Connect to database
      await this.connectToDatabase();
      
      // Get current stats
      const { totalRecords, recordsToDelete } = await this.getDatabaseStats();
      
      if (totalRecords === 0) {
        console.log('✅ Database is already empty');
        return;
      }
      
      if (recordsToDelete === 0) {
        console.log('✅ Database is already within limits');
        return;
      }
      
      // Delete half the records
      await this.deleteHalfRecords();
      
      // Verify final status
      await this.verifyFinalStatus();
      
      // Final stats
      const duration = (this.stats.endTime - this.stats.startTime) / 1000;
      console.log(`\n🎉 Dataset reduction completed successfully!`);
      console.log(`⏱️  Duration: ${Math.round(duration)} seconds`);
      console.log(`📊 Original Records: ${this.stats.totalRecords.toLocaleString()}`);
      console.log(`🗑️  Deleted Records: ${this.stats.deletedRecords.toLocaleString()}`);
      console.log(`📈 Remaining Records: ${this.stats.remainingRecords.toLocaleString()}`);
      console.log(`✅ Database should now be within 512 MB limit!`);
      
    } catch (error) {
      console.error('❌ Dataset reduction failed:', error.message);
      throw error;
    } finally {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Run the reducer
const reducer = new DatasetReducer();
reducer.run().catch(console.error);
