import mongoose from 'mongoose';
import fs from 'fs';
import csv from 'csv-parser';
import School from '../models/schoolModel.js';
import DataProcessor from './dataProcessor.js';

class BulkInserter {
  constructor(connectionString, databaseName) {
    this.connectionString = connectionString;
    this.databaseName = databaseName;
    this.processor = new DataProcessor();
    this.stats = {
      totalRecords: 0,
      insertedRecords: 0,
      errorRecords: 0,
      startTime: null,
      endTime: null
    };
  }

  // Connect to MongoDB Atlas
  async connect() {
    try {
      await mongoose.connect(this.connectionString, {
        dbName: this.databaseName,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('🔗 Connected to MongoDB Atlas');
      return true;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      return false;
    }
  }

  // Clear existing data
  async clearExistingData() {
    try {
      const result = await School.deleteMany({});
      console.log(`🗑️  Cleared ${result.deletedCount} existing records`);
      return result.deletedCount;
    } catch (error) {
      console.error('❌ Error clearing existing data:', error.message);
      return 0;
    }
  }

  // Process and insert data from CSV
  async processAndInsert(csvPath, limit = null) {
    this.stats.startTime = new Date();
    console.log('🚀 Starting bulk insert process...');

    try {
      // Connect to database
      const connected = await this.connect();
      if (!connected) {
        throw new Error('Failed to connect to MongoDB');
      }

      // Clear existing data
      await this.clearExistingData();

      // Process CSV file
      const results = [];
      let recordCount = 0;

      return new Promise((resolve, reject) => {
        fs.createReadStream(csvPath)
          .pipe(csv())
          .on('data', (data) => {
            results.push(data);
            recordCount++;
            
            // Limit records if specified (for free tier)
            if (limit && recordCount >= limit) {
              console.log(`📊 Reached limit of ${limit} records`);
              return;
            }
          })
          .on('end', async () => {
            try {
              console.log(`📊 Processing ${results.length} records...`);
              
              // Clean the data
              const cleanedData = this.processor.cleanData(results);
              console.log(`✅ Cleaned ${cleanedData.length} records`);
              
              // Insert in batches
              await this.insertInBatches(cleanedData);
              
              this.stats.endTime = new Date();
              this.stats.totalRecords = results.length;
              
              console.log('🎉 Bulk insert completed successfully!');
              console.log(this.getStats());
              
              resolve(this.stats);
            } catch (error) {
              reject(error);
            }
          })
          .on('error', reject);
      });

    } catch (error) {
      console.error('❌ Bulk insert failed:', error.message);
      throw error;
    }
  }

  // Insert data in batches for better performance
  async insertInBatches(data, batchSize = 1000) {
    const totalBatches = Math.ceil(data.length / batchSize);
    console.log(`📦 Inserting ${data.length} records in ${totalBatches} batches of ${batchSize}`);

    for (let i = 0; i < totalBatches; i++) {
      const start = i * batchSize;
      const end = Math.min(start + batchSize, data.length);
      const batch = data.slice(start, end);

      try {
        await School.insertMany(batch, { ordered: false });
        this.stats.insertedRecords += batch.length;
        console.log(`✅ Batch ${i + 1}/${totalBatches}: Inserted ${batch.length} records`);
      } catch (error) {
        // Handle duplicate key errors and other issues
        if (error.code === 11000) {
          console.log(`⚠️  Batch ${i + 1}: Some duplicates skipped`);
        } else {
          console.error(`❌ Batch ${i + 1} failed:`, error.message);
          this.stats.errorRecords += batch.length;
        }
      }
    }
  }

  // Create indexes for better performance
  async createIndexes() {
    try {
      console.log('🔧 Creating indexes for better performance...');
      
      await School.collection.createIndex({ state: 1, district: 1, block: 1, village: 1 });
      await School.collection.createIndex({ management_type: 1 });
      await School.collection.createIndex({ location: 1 });
      await School.collection.createIndex({ school_type: 1 });
      await School.collection.createIndex({ udise_code: 1 }, { unique: true });
      
      console.log('✅ Indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating indexes:', error.message);
    }
  }

  // Validate data integrity
  async validateData() {
    try {
      console.log('🔍 Validating data integrity...');
      
      const totalCount = await School.countDocuments();
      const stateCount = await School.distinct('state').length;
      const districtCount = await School.distinct('district').length;
      const managementCount = await School.distinct('management_type').length;
      
      console.log('📊 Data Validation Results:');
      console.log(`   Total Schools: ${totalCount}`);
      console.log(`   States: ${stateCount}`);
      console.log(`   Districts: ${districtCount}`);
      console.log(`   Management Types: ${managementCount}`);
      
      return {
        totalCount,
        stateCount,
        districtCount,
        managementCount
      };
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      return null;
    }
  }

  // Get processing statistics
  getStats() {
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

  // Close connection
  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting:', error.message);
    }
  }
}

// Main execution function
export const runBulkInsert = async (connectionString, databaseName, csvPath, limit = null) => {
  const inserter = new BulkInserter(connectionString, databaseName);
  
  try {
    // Process and insert data
    const stats = await inserter.processAndInsert(csvPath, limit);
    
    // Create indexes
    await inserter.createIndexes();
    
    // Validate data
    await inserter.validateData();
    
    return stats;
  } catch (error) {
    console.error('❌ Bulk insert process failed:', error.message);
    throw error;
  } finally {
    await inserter.disconnect();
  }
};

// Command line execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const connectionString = process.argv[2];
  const databaseName = process.argv[3];
  const csvPath = process.argv[4];
  const limit = process.argv[5] ? parseInt(process.argv[5]) : null;
  
  if (!connectionString || !databaseName || !csvPath) {
    console.error('Usage: node bulkInsert.js <connectionString> <databaseName> <csvPath> [limit]');
    process.exit(1);
  }
  
  runBulkInsert(connectionString, databaseName, csvPath, limit)
    .then(stats => {
      console.log('🎉 Process completed successfully!');
      console.log('Final Stats:', stats);
    })
    .catch(error => {
      console.error('❌ Process failed:', error.message);
      process.exit(1);
    });
}

export default BulkInserter;
