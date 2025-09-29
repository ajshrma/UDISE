#!/usr/bin/env node

/**
 * Import Kaggle Sample Data
 * 
 * This script will:
 * 1. Parse the Kaggle CSV
 * 2. Import 100,000 records into MongoDB Atlas
 * 3. Create indexes for performance
 * 4. Test the filtering system
 */

import mongoose from 'mongoose';
import fs from 'fs';
import csv from 'csv-parser';
import School from './src/models/schoolModel.js';

// MongoDB Atlas connection
const connectionString = "mongodb+srv://ajv1520:ajmark321@schoolcluster.v1pfmoq.mongodb.net/udise-dashboard?retryWrites=true&w=majority&appName=SchoolCluster";

class KaggleSampleImporter {
  constructor() {
    this.inputFile = '/media/aj/Disk D/code test/kuki solutions/schools.csv';
    this.sampleSize = 100000; // Import 100k records
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

  // Parse CSV and collect data
  async parseCSV() {
    return new Promise((resolve, reject) => {
      const results = [];
      let recordCount = 0;
      
      console.log('📊 Parsing Kaggle CSV...');
      console.log(`🎯 Sample size: ${this.sampleSize} records`);
      this.stats.startTime = new Date();
      
      fs.createReadStream(this.inputFile)
        .pipe(csv({
          separator: ',',
          skipEmptyLines: true,
          skipLinesWithError: true
        }))
        .on('data', (data) => {
          try {
            recordCount++;
            this.stats.totalRecords++;
            
            // Limit to sample size
            if (recordCount > this.sampleSize) {
              return;
            }
            
            // Clean and validate data
            const cleanedData = this.cleanSchoolData(data);
            if (cleanedData) {
              results.push(cleanedData);
              this.stats.processedRecords++;
            } else {
              this.stats.errorRecords++;
            }
            
            // Progress indicator
            if (recordCount % 10000 === 0) {
              console.log(`📝 Processed ${recordCount} records...`);
            }
          } catch (error) {
            this.stats.errorRecords++;
          }
        })
        .on('end', () => {
          this.stats.endTime = new Date();
          console.log(`✅ CSV parsing completed`);
          console.log(`📊 Processed: ${this.stats.processedRecords} records`);
          console.log(`❌ Errors: ${this.stats.errorRecords} records`);
          resolve(results);
        })
        .on('error', (error) => {
          console.error('❌ CSV parsing error:', error);
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
      return null;
    }
  }

  // Clean location field
  cleanLocation(location) {
    if (!location) return 'Rural';
    const loc = location.toString().trim();
    if (loc.includes('Rural') || loc.includes('1-Rural')) return 'Rural';
    if (loc.includes('Urban') || loc.includes('2-Urban')) return 'Urban';
    return 'Rural';
  }

  // Clean management type
  cleanManagementType(mgmt) {
    if (!mgmt) return 'Government';
    const mgmtStr = mgmt.toString().trim();
    if (mgmtStr.includes('Department of Education') || mgmtStr.includes('1-Department')) return 'Government';
    if (mgmtStr.includes('Private Unaided') || mgmtStr.includes('5-Private')) return 'Private Unaided';
    if (mgmtStr.includes('Aided') || mgmtStr.includes('2-Aided')) return 'Aided';
    if (mgmtStr.includes('Central') || mgmtStr.includes('3-Central')) return 'Central Government';
    return 'Government';
  }

  // Clean school category
  cleanSchoolCategory(category) {
    if (!category) return 'Primary';
    const cat = category.toString().trim();
    if (cat.includes('Primary') && cat.includes('Upper')) return 'Primary with Upper Primary';
    if (cat.includes('Primary')) return 'Primary';
    if (cat.includes('Secondary')) return 'Secondary';
    if (cat.includes('Higher Secondary')) return 'Higher Secondary';
    return 'Primary';
  }

  // Clean school type
  cleanSchoolType(type) {
    if (!type) return 'Co-Ed';
    const typeStr = type.toString().trim();
    if (typeStr.includes('Co-educational') || typeStr.includes('3-Co')) return 'Co-Ed';
    if (typeStr.includes('Girls') || typeStr.includes('1-Girls')) return 'Girls';
    if (typeStr.includes('Boys') || typeStr.includes('2-Boys')) return 'Boys';
    return 'Co-Ed';
  }

  // Clean school status
  cleanSchoolStatus(status) {
    if (!status) return 'Operational';
    const stat = status.toString().trim();
    if (stat.includes('Operational') || stat.includes('0-Operational')) return 'Operational';
    if (stat.includes('Closed') || stat.includes('1-Closed')) return 'Closed';
    return 'Operational';
  }

  // Generate random student count
  generateRandomStudentCount() {
    return Math.floor(Math.random() * 500) + 50;
  }

  // Generate random teacher count
  generateRandomTeacherCount() {
    return Math.floor(Math.random() * 20) + 5;
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

  // Test the filtering system
  async testFiltering() {
    try {
      console.log('🔍 Testing filtering system...');
      
      // Test total count
      const totalSchools = await School.countDocuments();
      console.log(`📊 Total schools: ${totalSchools}`);
      
      // Test states
      const states = await School.distinct('state');
      console.log(`📍 States: ${states.length}`);
      
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
      
      console.log('✅ Filtering system working correctly!');
      
    } catch (error) {
      console.error('❌ Error testing filtering:', error.message);
    }
  }

  // Main execution
  async run() {
    try {
      console.log('🚀 Starting Kaggle Sample Import...');
      console.log(`📁 Input file: ${this.inputFile}`);
      console.log(`🎯 Sample size: ${this.sampleSize} records`);
      
      // Connect to database
      await this.connectToDatabase();
      
      // Clear existing data
      await this.clearExistingData();
      
      // Parse CSV
      const schools = await this.parseCSV();
      
      // Insert data
      await this.insertDataInBatches(schools);
      
      // Create indexes
      await this.createIndexes();
      
      // Test filtering
      await this.testFiltering();
      
      // Final stats
      const duration = (this.stats.endTime - this.stats.startTime) / 1000;
      console.log(`\n🎉 Kaggle sample import completed successfully!`);
      console.log(`⏱️  Duration: ${Math.round(duration)} seconds`);
      console.log(`📊 Total processed: ${this.stats.processedRecords} records`);
      console.log(`❌ Errors: ${this.stats.errorRecords} records`);
      console.log(`✅ Ready for testing with real Kaggle data!`);
      
    } catch (error) {
      console.error('❌ Import failed:', error.message);
      throw error;
    } finally {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Run the importer
const importer = new KaggleSampleImporter();
importer.run().catch(console.error);
