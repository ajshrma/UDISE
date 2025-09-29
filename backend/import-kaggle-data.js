#!/usr/bin/env node

/**
 * Kaggle Data Import Script
 * 
 * This script will:
 * 1. Download Kaggle dataset (if not present)
 * 2. Process and clean the data
 * 3. Insert into MongoDB Atlas
 * 4. Create indexes and validate
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import School from './src/models/schoolModel.js';
import DataProcessor from './src/utils/dataProcessor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class KaggleDataImporter {
  constructor() {
    this.connectionString = process.env.MONGO_URI || 'mongodb://localhost:27017/udise-dashboard';
    this.databaseName = process.env.DB_NAME || 'udise-dashboard';
    this.kaggleUrl = 'https://www.kaggle.com/datasets/hritikakolkar/schools';
    this.dataDir = path.join(__dirname, 'data');
    this.rawCsvPath = path.join(this.dataDir, 'schools.csv');
    this.processedCsvPath = path.join(this.dataDir, 'schools_processed.csv');
    this.stats = {
      startTime: null,
      endTime: null,
      totalRecords: 0,
      insertedRecords: 0,
      errorRecords: 0,
      skippedRecords: 0
    };
  }

  // Create data directory
  createDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
      console.log(`📁 Created data directory: ${this.dataDir}`);
    }
  }

  // Check if Kaggle dataset exists
  checkKaggleDataset() {
    if (fs.existsSync(this.rawCsvPath)) {
      console.log('✅ Kaggle dataset found');
      return true;
    } else {
      console.log('❌ Kaggle dataset not found');
      console.log('\n📥 Please download the dataset manually:');
      console.log(`   URL: ${this.kaggleUrl}`);
      console.log(`   Save as: ${this.rawCsvPath}`);
      console.log('\n💡 Instructions:');
      console.log('   1. Go to the Kaggle link above');
      console.log('   2. Download the CSV file');
      console.log('   3. Save it as "schools.csv" in the data folder');
      console.log('   4. Run this script again');
      return false;
    }
  }

  // Process the Kaggle dataset
  async processDataset() {
    try {
      console.log('🔄 Processing Kaggle dataset...');
      
      const processor = new DataProcessor();
      const result = await processor.processCSV(this.rawCsvPath, this.processedCsvPath);
      
      console.log('📊 Processing Results:');
      console.log(`   Total Records: ${result.totalRecords}`);
      console.log(`   Cleaned Records: ${result.cleanedRecords}`);
      console.log(`   Error Records: ${result.errorRecords}`);
      console.log(`   Success Rate: ${Math.round((result.cleanedRecords / result.totalRecords) * 100)}%`);
      
      this.stats.totalRecords = result.cleanedRecords;
      return true;
    } catch (error) {
      console.error('❌ Error processing dataset:', error.message);
      return false;
    }
  }

  // Connect to MongoDB
  async connectToMongoDB() {
    try {
      console.log('🔗 Connecting to MongoDB Atlas...');
      await mongoose.connect(this.connectionString, {
        dbName: this.databaseName,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ Connected to MongoDB Atlas');
      return true;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      return false;
    }
  }

  // Clear existing data
  async clearExistingData() {
    try {
      console.log('🗑️  Clearing existing data...');
      const result = await School.deleteMany({});
      console.log(`✅ Cleared ${result.deletedCount} existing records`);
      return true;
    } catch (error) {
      console.error('❌ Error clearing data:', error.message);
      return false;
    }
  }

  // Insert data in batches
  async insertDataInBatches(batchSize = 1000) {
    try {
      console.log('📦 Inserting data in batches...');
      
      const data = [];
      let recordCount = 0;
      let batchCount = 0;
      
      return new Promise((resolve, reject) => {
        const csv = require('csv-parser');
        
        fs.createReadStream(this.processedCsvPath)
          .pipe(csv())
          .on('data', async (record) => {
            data.push(record);
            recordCount++;
            
            // Process batch when it reaches batchSize
            if (data.length >= batchSize) {
              batchCount++;
              try {
                await this.processBatch(data, batchCount);
                this.stats.insertedRecords += data.length;
                data.length = 0; // Clear array
              } catch (error) {
                console.error(`❌ Batch ${batchCount} failed:`, error.message);
                this.stats.errorRecords += data.length;
                data.length = 0;
              }
            }
          })
          .on('end', async () => {
            // Process remaining data
            if (data.length > 0) {
              batchCount++;
              try {
                await this.processBatch(data, batchCount);
                this.stats.insertedRecords += data.length;
              } catch (error) {
                console.error(`❌ Final batch failed:`, error.message);
                this.stats.errorRecords += data.length;
              }
            }
            
            console.log(`✅ Completed ${batchCount} batches`);
            resolve();
          })
          .on('error', reject);
      });
    } catch (error) {
      console.error('❌ Error inserting data:', error.message);
      throw error;
    }
  }

  // Process a single batch
  async processBatch(batch, batchNumber) {
    try {
      await School.insertMany(batch, { ordered: false });
      console.log(`✅ Batch ${batchNumber}: Inserted ${batch.length} records`);
    } catch (error) {
      if (error.code === 11000) {
        console.log(`⚠️  Batch ${batchNumber}: Some duplicates skipped`);
      } else {
        throw error;
      }
    }
  }

  // Create indexes
  async createIndexes() {
    try {
      console.log('🔧 Creating indexes...');
      
      await School.collection.createIndex({ state: 1, district: 1, block: 1, village: 1 });
      await School.collection.createIndex({ management_type: 1 });
      await School.collection.createIndex({ location: 1 });
      await School.collection.createIndex({ school_type: 1 });
      await School.collection.createIndex({ udise_code: 1 }, { unique: true });
      
      console.log('✅ Indexes created successfully');
      return true;
    } catch (error) {
      console.error('❌ Error creating indexes:', error.message);
      return false;
    }
  }

  // Validate the import
  async validateImport() {
    try {
      console.log('🔍 Validating import...');
      
      const totalCount = await School.countDocuments();
      const stateCount = await School.distinct('state').length;
      const districtCount = await School.distinct('district').length;
      const managementCount = await School.distinct('management_type').length;
      
      console.log('\n📊 Import Validation Results:');
      console.log(`   Total Schools: ${totalCount.toLocaleString()}`);
      console.log(`   States: ${stateCount}`);
      console.log(`   Districts: ${districtCount}`);
      console.log(`   Management Types: ${managementCount}`);
      
      // Test sample queries
      const sampleQuery = await School.find({ state: 'Madhya Pradesh' }).limit(1);
      console.log(`   Sample Query: ${sampleQuery.length > 0 ? '✅ Working' : '❌ Failed'}`);
      
      return true;
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      return false;
    }
  }

  // Get final statistics
  getFinalStats() {
    const duration = this.stats.endTime - this.stats.startTime;
    const rate = this.stats.insertedRecords / (duration / 1000);
    
    return {
      totalRecords: this.stats.totalRecords,
      insertedRecords: this.stats.insertedRecords,
      errorRecords: this.stats.errorRecords,
      duration: `${Math.round(duration / 1000)}s`,
      rate: `${Math.round(rate)} records/sec`,
      successRate: `${Math.round((this.stats.insertedRecords / this.stats.totalRecords) * 100)}%`
    };
  }

  // Main import process
  async runImport() {
    this.stats.startTime = new Date();
    console.log('🚀 Starting Kaggle Data Import...\n');

    try {
      // Step 1: Create data directory
      this.createDataDirectory();

      // Step 2: Check if dataset exists
      if (!this.checkKaggleDataset()) {
        return false;
      }

      // Step 3: Process dataset
      const processed = await this.processDataset();
      if (!processed) {
        throw new Error('Failed to process dataset');
      }

      // Step 4: Connect to MongoDB
      const connected = await this.connectToMongoDB();
      if (!connected) {
        throw new Error('Failed to connect to MongoDB');
      }

      // Step 5: Clear existing data
      await this.clearExistingData();

      // Step 6: Insert data in batches
      await this.insertDataInBatches();

      // Step 7: Create indexes
      await this.createIndexes();

      // Step 8: Validate import
      await this.validateImport();

      this.stats.endTime = new Date();
      const stats = this.getFinalStats();

      console.log('\n🎉 Data Import Completed Successfully!');
      console.log('=====================================');
      console.log(`⏱️  Duration: ${stats.duration}`);
      console.log(`📊 Total Records: ${stats.totalRecords.toLocaleString()}`);
      console.log(`✅ Inserted: ${stats.insertedRecords.toLocaleString()}`);
      console.log(`❌ Errors: ${stats.errorRecords.toLocaleString()}`);
      console.log(`📈 Success Rate: ${stats.successRate}`);
      console.log(`⚡ Rate: ${stats.rate}`);

      return true;

    } catch (error) {
      console.error('\n❌ Import failed:', error.message);
      return false;
    } finally {
      await mongoose.disconnect();
    }
  }
}

// Run the import
const importer = new KaggleDataImporter();
importer.runImport()
  .then(success => {
    if (success) {
      console.log('\n🎯 Next Steps:');
      console.log('1. Test the backend APIs');
      console.log('2. Connect frontend to real data');
      console.log('3. Deploy to production');
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Import process failed:', error.message);
    process.exit(1);
  });
