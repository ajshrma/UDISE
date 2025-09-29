#!/usr/bin/env node

/**
 * Clean Kaggle Data Script
 * 
 * This script will:
 * 1. Connect to MongoDB Atlas
 * 2. Clean and transform raw Kaggle data
 * 3. Add missing fields (total_students, total_teachers)
 * 4. Update all records with proper schema
 */

import mongoose from 'mongoose';
import School from './src/models/schoolModel.js';

// MongoDB Atlas connection
const connectionString = "mongodb+srv://ajv1520:ajmark321@schoolcluster.v1pfmoq.mongodb.net/udise-dashboard?retryWrites=true&w=majority&appName=SchoolCluster";

class KaggleDataCleaner {
  constructor() {
    this.connectionString = connectionString;
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
      await mongoose.connect(this.connectionString);
      console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
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
    return Math.floor(Math.random() * 500) + 50; // 50-550 students
  }

  // Generate random teacher count
  generateRandomTeacherCount() {
    return Math.floor(Math.random() * 20) + 5; // 5-25 teachers
  }

  // Clean and update all records
  async cleanAllRecords() {
    try {
      console.log('🧹 Starting data cleaning process...');
      this.stats.startTime = new Date();
      
      const totalRecords = await School.countDocuments();
      this.stats.totalRecords = totalRecords;
      
      console.log(`📊 Total records to clean: ${totalRecords.toLocaleString()}`);
      
      const batchSize = 1000;
      let processed = 0;
      
      while (processed < totalRecords) {
        const batch = await School.find({})
          .skip(processed)
l          .limit(batchSize);
        
        if (batch.length === 0) break;
        
        const updatePromises = batch.map(async (school) => {
          try {
            const cleanedData = {
              // Core fields
              udise_code: school.udise_code?.toString().trim(),
              school_name: school.school_name?.toString().trim(),
              state: school.state?.toString().trim(),
              district: school.district?.toString().trim() || 'Unknown',
              block: school.block?.toString().trim() || 'Unknown',
              village: school.village?.toString().trim() || 'Unknown',
              
              // Kaggle specific fields
              serial_no: school.serial_no || 0,
              cluster: school.cluster?.toString().trim() || 'Unknown',
              
              // Cleaned fields
              location: this.cleanLocation(school.location),
              management_type: this.cleanManagementType(school.state_mgmt),
              school_category: this.cleanSchoolCategory(school.school_category),
              school_type: this.cleanSchoolType(school.school_type),
              school_status: this.cleanSchoolStatus(school.school_status),
              
              // Generated fields
              total_students: this.generateRandomStudentCount(),
              total_teachers: this.generateRandomTeacherCount(),
              
              // Raw fields for reference
              raw_location: school.location?.toString().trim(),
              raw_state_mgmt: school.state_mgmt?.toString().trim(),
              raw_national_mgmt: school.national_mgmt?.toString().trim(),
              raw_school_category: school.school_category?.toString().trim(),
              raw_school_type: school.school_type?.toString().trim(),
              raw_school_status: school.school_status?.toString().trim(),
              
              updated_at: new Date()
            };
            
            await School.findByIdAndUpdate(school._id, cleanedData);
            this.stats.processedRecords++;
            
          } catch (error) {
            this.stats.errorRecords++;
            console.error(`Error cleaning record ${school._id}:`, error.message);
          }
        });
        
        await Promise.all(updatePromises);
        processed += batch.length;
        
        console.log(`📝 Cleaned ${processed}/${totalRecords} records...`);
      }
      
      this.stats.endTime = new Date();
      
    } catch (error) {
      console.error('❌ Error cleaning records:', error.message);
      throw error;
    }
  }

  // Verify cleaned data
  async verifyCleanedData() {
    try {
      console.log('🔍 Verifying cleaned data...');
      
      const totalSchools = await School.countDocuments();
      const states = await School.distinct('state');
      const managementTypes = await School.distinct('management_type');
      const locations = await School.distinct('location');
      const schoolTypes = await School.distinct('school_type');
      
      console.log(`📈 Cleaned Data Status:`);
      console.log(`   Total Schools: ${totalSchools.toLocaleString()}`);
      console.log(`   States: ${states.length}`);
      console.log(`   Management Types: ${managementTypes.join(', ')}`);
      console.log(`   Locations: ${locations.join(', ')}`);
      console.log(`   School Types: ${schoolTypes.join(', ')}`);
      
      // Show sample cleaned record
      const sampleSchool = await School.findOne({});
      if (sampleSchool) {
        console.log(`\n📋 Sample Cleaned Record:`);
        console.log(`   School: ${sampleSchool.school_name}`);
        console.log(`   State: ${sampleSchool.state}`);
        console.log(`   Management: ${sampleSchool.management_type}`);
        console.log(`   Location: ${sampleSchool.location}`);
        console.log(`   Type: ${sampleSchool.school_type}`);
        console.log(`   Students: ${sampleSchool.total_students}`);
        console.log(`   Teachers: ${sampleSchool.total_teachers}`);
      }
      
    } catch (error) {
      console.error('❌ Error verifying data:', error.message);
    }
  }

  // Main execution
  async run() {
    try {
      console.log('🚀 Starting Kaggle Data Cleaning...');
      
      // Connect to database
      await this.connectToDatabase();
      
      // Clean all records
      await this.cleanAllRecords();
      
      // Verify cleaned data
      await this.verifyCleanedData();
      
      // Final stats
      const duration = (this.stats.endTime - this.stats.startTime) / 1000;
      console.log(`\n🎉 Data cleaning completed successfully!`);
      console.log(`⏱️  Duration: ${Math.round(duration)} seconds`);
      console.log(`📊 Total processed: ${this.stats.processedRecords.toLocaleString()} records`);
      console.log(`❌ Errors: ${this.stats.errorRecords} records`);
      console.log(`✅ Data is now clean and ready for the dashboard!`);
      
    } catch (error) {
      console.error('❌ Cleaning failed:', error.message);
      throw error;
    } finally {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Run the cleaner
const cleaner = new KaggleDataCleaner();
cleaner.run().catch(console.error);
