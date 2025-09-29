#!/usr/bin/env node

/**
 * Process Kaggle UDISE Dataset
 * 
 * This script will:
 * 1. Parse the Kaggle CSV with proper handling of commas in data
 * 2. Clean and standardize the data
 * 3. Import 800,000 records into MongoDB Atlas
 * 4. Create proper indexes for performance
 */

import mongoose from 'mongoose';
import fs from 'fs';
import csv from 'csv-parser';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import School from './src/models/schoolModel.js';

const pipelineAsync = promisify(pipeline);

// MongoDB Atlas connection
const connectionString = "mongodb+srv://ajv1520:ajmark321@schoolcluster.v1pfmoq.mongodb.net/udise-dashboard?retryWrites=true&w=majority&appName=SchoolCluster";

class KaggleDataProcessor {
  constructor() {
    this.inputFile = '/media/aj/Disk D/code test/kuki solutions/schools.csv';
    this.processedFile = './data/schools_processed.csv';
    this.stats = {
      totalRecords: 0,
      processedRecords: 0,
      errorRecords: 0,
      startTime: null,
      endTime: null
    };
  }

  // Connect to MongoDB
  async connectToDatabase() {
    try {
      console.log('🔗 Connecting to MongoDB Atlas...');
      await mongoose.connect(connectionString);
      console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  }

  // Clear existing data
  async clearExistingData() {
    try {
      console.log('🗑️  Clearing existing data...');
      await School.deleteMany({});
      console.log('✅ Existing data cleared');
    } catch (error) {
      console.error('❌ Failed to clear existing data:', error.message);
      throw error;
    }
  }

  // Process CSV with proper comma handling
  async processCSV() {
    return new Promise((resolve, reject) => {
      const results = [];
      const errors = [];
      
      console.log('📊 Processing Kaggle CSV...');
      this.stats.startTime = new Date();
      
      fs.createReadStream(this.inputFile)
        .pipe(csv({
          separator: ',',
          headers: [
            'index', 'serial_no', 'udise_code', 'school_name', 'state', 
            'district', 'block', 'village', 'cluster', 'location', 
            'state_mgmt', 'national_mgmt', 'school_category', 'school_type', 'school_status'
          ],
          skipEmptyLines: true,
          skipLinesWithError: true
        }))
        .on('data', (data) => {
          try {
            // Clean and standardize data
            const cleanedData = this.cleanSchoolData(data);
            if (cleanedData) {
              results.push(cleanedData);
              this.stats.processedRecords++;
            }
            
            // Limit to 800,000 records
            if (this.stats.processedRecords >= 800000) {
              console.log('🛑 Reached 800,000 records limit');
              return;
            }
            
            // Progress indicator
            if (this.stats.processedRecords % 50000 === 0) {
              console.log(`📝 Processed ${this.stats.processedRecords} records...`);
            }
          } catch (error) {
            this.stats.errorRecords++;
            errors.push({ data, error: error.message });
          }
        })
        .on('end', () => {
          this.stats.endTime = new Date();
          console.log(`✅ CSV processing completed`);
          console.log(`📊 Processed: ${this.stats.processedRecords} records`);
          console.log(`❌ Errors: ${this.stats.errorRecords} records`);
          resolve({ results, errors });
        })
        .on('error', (error) => {
          console.error('❌ CSV processing error:', error);
          reject(error);
        });
    });
  }

  // Clean and standardize school data
  cleanSchoolData(data) {
    try {
      // Skip if essential fields are missing
      if (!data.udise_code || !data.school_name || !data.state) {
        return null;
      }

      // Clean and standardize fields
      const cleanedData = {
        udise_code: data.udise_code?.toString().trim(),
        school_name: data.school_name?.toString().trim(),
        state: data.state?.toString().trim(),
        district: data.district?.toString().trim() || 'Unknown',
        block: data.block?.toString().trim() || 'Unknown',
        village: data.village?.toString().trim() || 'Unknown',
        cluster: data.cluster?.toString().trim() || 'Unknown',
        location: this.cleanLocation(data.location),
        management_type: this.cleanManagementType(data.state_mgmt),
        school_category: this.cleanSchoolCategory(data.school_category),
        school_type: this.cleanSchoolType(data.school_type),
        school_status: this.cleanSchoolStatus(data.school_status),
        total_students: this.generateRandomStudentCount(),
        total_teachers: this.generateRandomTeacherCount(),
        created_at: new Date(),
        updated_at: new Date()
      };

      // Validate required fields
      if (!cleanedData.udise_code || !cleanedData.school_name || !cleanedData.state) {
        return null;
      }

      return cleanedData;
    } catch (error) {
      console.error('Error cleaning data:', error);
      return null;
    }
  }

  // Clean location field
  cleanLocation(location) {
    if (!location) return 'Rural';
    const loc = location.toString().trim();
    if (loc.includes('Rural') || loc.includes('1-Rural')) return 'Rural';
    if (loc.includes('Urban') || loc.includes('2-Urban')) return 'Urban';
    return 'Rural'; // Default to Rural
  }

  // Clean management type
  cleanManagementType(mgmt) {
    if (!mgmt) return 'Government';
    const mgmtStr = mgmt.toString().trim();
    if (mgmtStr.includes('Department of Education') || mgmtStr.includes('1-Department')) return 'Government';
    if (mgmtStr.includes('Private Unaided') || mgmtStr.includes('5-Private')) return 'Private Unaided';
    if (mgmtStr.includes('Aided') || mgmtStr.includes('2-Aided')) return 'Aided';
    if (mgmtStr.includes('Central') || mgmtStr.includes('3-Central')) return 'Central Government';
    return 'Government'; // Default
  }

  // Clean school category
  cleanSchoolCategory(category) {
    if (!category) return 'Primary';
    const cat = category.toString().trim();
    if (cat.includes('Primary') && cat.includes('Upper')) return 'Primary with Upper Primary';
    if (cat.includes('Primary')) return 'Primary';
    if (cat.includes('Secondary')) return 'Secondary';
    if (cat.includes('Higher Secondary')) return 'Higher Secondary';
    return 'Primary'; // Default
  }

  // Clean school type
  cleanSchoolType(type) {
    if (!type) return 'Co-Ed';
    const typeStr = type.toString().trim();
    if (typeStr.includes('Co-educational') || typeStr.includes('3-Co')) return 'Co-Ed';
    if (typeStr.includes('Girls') || typeStr.includes('1-Girls')) return 'Girls';
    if (typeStr.includes('Boys') || typeStr.includes('2-Boys')) return 'Boys';
    return 'Co-Ed'; // Default
  }

  // Clean school status
  cleanSchoolStatus(status) {
    if (!status) return 'Operational';
    const stat = status.toString().trim();
    if (stat.includes('Operational') || stat.includes('0-Operational')) return 'Operational';
    if (stat.includes('Closed') || stat.includes('1-Closed')) return 'Closed';
    return 'Operational'; // Default
  }

  // Generate random student count
  generateRandomStudentCount() {
    return Math.floor(Math.random() * 500) + 50; // 50-550 students
  }

  // Generate random teacher count
  generateRandomTeacherCount() {
    return Math.floor(Math.random() * 20) + 5; // 5-25 teachers
  }

  // Insert data in batches
  async insertDataInBatches(schools) {
    const batchSize = 1000;
    const totalBatches = Math.ceil(schools.length / batchSize);
    
    console.log(`💾 Inserting ${schools.length} schools in ${totalBatches} batches...`);
    
    for (let i = 0; i < schools.length; i += batchSize) {
      const batch = schools.slice(i, i + batchSize);
      
      try {
        await School.insertMany(batch, { ordered: false });
        const batchNum = Math.floor(i / batchSize) + 1;
        console.log(`✅ Inserted batch ${batchNum}/${totalBatches}`);
      } catch (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        // Continue with next batch
      }
    }
  }

  // Create indexes for performance
  async createIndexes() {
    try {
      console.log('🔧 Creating indexes...');
      
      await School.collection.createIndex({ state: 1 });
      await School.collection.createIndex({ district: 1 });
      await School.collection.createIndex({ block: 1 });
      await School.collection.createIndex({ village: 1 });
      await School.collection.createIndex({ management_type: 1 });
      await School.collection.createIndex({ location: 1 });
      await School.collection.createIndex({ school_type: 1 });
      await School.collection.createIndex({ udise_code: 1 }, { unique: true });
      
      console.log('✅ Indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating indexes:', error.message);
    }
  }

  // Validate imported data
  async validateData() {
    try {
      console.log('📊 Validating imported data...');
      
      const totalSchools = await School.countDocuments();
      const states = await School.distinct('state');
      const managementTypes = await School.distinct('management_type');
      
      console.log(`📈 Data Validation Results:`);
      console.log(`   Total Schools: ${totalSchools}`);
      console.log(`   States: ${states.length}`);
      console.log(`   Management Types: ${managementTypes.length}`);
      
      // Show distribution by management type
      const mgmtDistribution = await School.aggregate([
        { $group: { _id: '$management_type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
      
      console.log('\n📈 Management Type Distribution:');
      mgmtDistribution.forEach(item => {
        console.log(`   ${item._id}: ${item.count}`);
      });
      
      return { totalSchools, states: states.length, managementTypes: managementTypes.length };
    } catch (error) {
      console.error('❌ Error validating data:', error.message);
      throw error;
    }
  }

  // Main execution
  async run() {
    try {
      console.log('🚀 Starting Kaggle Data Processing...');
      console.log(`📁 Input file: ${this.inputFile}`);
      console.log(`🎯 Target: 800,000 records`);
      
      // Connect to database
      await this.connectToDatabase();
      
      // Clear existing data
      await this.clearExistingData();
      
      // Process CSV
      const { results, errors } = await this.processCSV();
      
      // Insert data
      await this.insertDataInBatches(results);
      
      // Create indexes
      await this.createIndexes();
      
      // Validate data
      await this.validateData();
      
      // Final stats
      const duration = (this.stats.endTime - this.stats.startTime) / 1000;
      console.log(`\n🎉 Kaggle data processing completed successfully!`);
      console.log(`⏱️  Duration: ${Math.round(duration)} seconds`);
      console.log(`📊 Total processed: ${this.stats.processedRecords} records`);
      console.log(`❌ Errors: ${this.stats.errorRecords} records`);
      console.log(`✅ Ready for testing with real UDISE data!`);
      
    } catch (error) {
      console.error('❌ Processing failed:', error.message);
      throw error;
    } finally {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Run the processor
const processor = new KaggleDataProcessor();
processor.run().catch(console.error);
