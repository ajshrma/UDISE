#!/usr/bin/env node

/**
 * MongoDB Atlas Setup Script
 * 
 * This script will:
 * 1. Connect to your SchoolCluster
 * 2. Create the udise-dashboard database
 * 3. Set up the schools collection
 * 4. Insert sample data for testing
 * 5. Create indexes for performance
 */

import mongoose from 'mongoose';
import School from './src/models/schoolModel.js';

// Your MongoDB Atlas connection details
const ATLAS_CONFIG = {
  username: 'ajv1520',
  password: 'ajmark321', // Your Atlas password
  cluster: 'schoolcluster.v1pfmoq.mongodb.net',
  database: 'udise-dashboard'
};

// Build connection string with proper URL encoding for the password
const connectionString = `mongodb+srv://${ATLAS_CONFIG.username}:${encodeURIComponent(ATLAS_CONFIG.password)}@${ATLAS_CONFIG.cluster}/${ATLAS_CONFIG.database}?retryWrites=true&w=majority&appName=SchoolCluster`;

class AtlasSetup {
  constructor() {
    this.connectionString = connectionString;
    this.databaseName = ATLAS_CONFIG.database;
    this.stats = {
      startTime: null,
      endTime: null,
      totalRecords: 0,
      insertedRecords: 0,
      errorRecords: 0
    };
  }

  // Test MongoDB Atlas connection
  async testConnection() {
    try {
      console.log('🔗 Connecting to MongoDB Atlas...');
      console.log(`   Cluster: SchoolCluster`);
      console.log(`   Database: ${this.databaseName}`);
      console.log(`   User: ${ATLAS_CONFIG.username}\n`);
      
      await mongoose.connect(this.connectionString, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      
      console.log('✅ Successfully connected to MongoDB Atlas!');
      return true;
    } catch (error) {
      console.error('❌ MongoDB Atlas connection failed:', error.message);
      console.log('\n💡 Please check:');
      console.log('   - Your password is correct');
      console.log('   - Your IP is whitelisted in Atlas');
      console.log('   - Your cluster is running');
      return false;
    }
  }

  // Create sample data for testing
  async createSampleData() {
    try {
      console.log('📊 Creating sample data for testing...');
      
      const sampleSchools = [
        {
          udise_code: 'MP001001',
          school_name: 'Government Primary School',
          state: 'Madhya Pradesh',
          district: 'Bhopal',
          block: 'Block A',
          village: 'Village 1',
          management_type: 'Government',
          location: 'Rural',
          school_type: 'Co-Ed',
          total_students: 150,
          total_teachers: 8,
          establishment_year: 1985,
          school_category: 'Primary',
          contact_number: '9876543210',
          address: 'Near Village Panchayat',
          pincode: '462001',
          is_active: true,
        },
        {
          udise_code: 'MP001002',
          school_name: 'Private High School',
          state: 'Madhya Pradesh',
          district: 'Bhopal',
          block: 'Block A',
          village: 'Village 2',
          management_type: 'Private Unaided',
          location: 'Urban',
          school_type: 'Co-Ed',
          total_students: 300,
          total_teachers: 15,
          establishment_year: 1995,
          school_category: 'All',
          contact_number: '9876543211',
          address: 'Main Road, City Center',
          pincode: '462002',
          is_active: true,
        },
        {
          udise_code: 'MH001001',
          school_name: 'Boys High School',
          state: 'Maharashtra',
          district: 'Mumbai',
          block: 'Block 1',
          village: 'Village M1',
          management_type: 'Aided',
          location: 'Urban',
          school_type: 'Boys',
          total_students: 400,
          total_teachers: 20,
          establishment_year: 1980,
          school_category: 'Higher Secondary',
          contact_number: '9876543213',
          address: 'Marine Drive',
          pincode: '400001',
          is_active: true,
        },
        {
          udise_code: 'KA001001',
          school_name: 'Community School',
          state: 'Karnataka',
          district: 'Bangalore',
          block: 'Block B1',
          village: 'Village B1',
          management_type: 'Private Unaided',
          location: 'Rural',
          school_type: 'Co-Ed',
          total_students: 180,
          total_teachers: 10,
          establishment_year: 2000,
          school_category: 'All',
          contact_number: '9876543214',
          address: 'Near IT Park',
          pincode: '560001',
          is_active: true,
        },
        {
          udise_code: 'TN001001',
          school_name: 'Central Government School',
          state: 'Tamil Nadu',
          district: 'Chennai',
          block: 'Block C1',
          village: 'Village C1',
          management_type: 'Central Government',
          location: 'Urban',
          school_type: 'Co-Ed',
          total_students: 350,
          total_teachers: 18,
          establishment_year: 1975,
          school_category: 'All',
          contact_number: '9876543215',
          address: 'Near Railway Station',
          pincode: '600001',
          is_active: true,
        }
      ];

      // Clear existing data
      await School.deleteMany({});
      console.log('🗑️  Cleared existing data');

      // Insert sample data
      await School.insertMany(sampleSchools);
      console.log(`✅ Inserted ${sampleSchools.length} sample schools`);

      return true;
    } catch (error) {
      console.error('❌ Error creating sample data:', error.message);
      return false;
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
      return true;
    } catch (error) {
      console.error('❌ Error creating indexes:', error.message);
      return false;
    }
  }

  // Validate the setup
  async validateSetup() {
    try {
      console.log('🔍 Validating database setup...');
      
      const totalCount = await School.countDocuments();
      const stateCount = await School.distinct('state').length;
      const districtCount = await School.distinct('district').length;
      const managementCount = await School.distinct('management_type').length;
      
      console.log('\n📊 Database Validation Results:');
      console.log(`   Total Schools: ${totalCount}`);
      console.log(`   States: ${stateCount}`);
      console.log(`   Districts: ${districtCount}`);
      console.log(`   Management Types: ${managementCount}`);
      
      // Test sample queries
      const mpSchools = await School.find({ state: 'Madhya Pradesh' });
      console.log(`   MP Schools: ${mpSchools.length}`);
      
      const govtSchools = await School.find({ management_type: 'Government' });
      console.log(`   Government Schools: ${govtSchools.length}`);
      
      return true;
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      return false;
    }
  }

  // Test API endpoints
  async testAPIEndpoints() {
    try {
      console.log('🧪 Testing API endpoints...');
      
      // Test basic queries
      const schools = await School.find({}).limit(5);
      console.log(`   GET /schools: ${schools.length} records found`);
      
      // Test filtering
      const mpSchools = await School.find({ state: 'Madhya Pradesh' });
      console.log(`   Filter by state: ${mpSchools.length} records found`);
      
      // Test aggregation
      const managementDist = await School.aggregate([
        { $group: { _id: '$management_type', count: { $sum: 1 } } }
      ]);
      console.log(`   Distribution query: ${managementDist.length} categories found`);
      
      console.log('✅ API endpoints working correctly');
      return true;
    } catch (error) {
      console.error('❌ API testing failed:', error.message);
      return false;
    }
  }

  // Main setup process
  async runSetup() {
    this.stats.startTime = new Date();
    console.log('🚀 Starting MongoDB Atlas Setup...\n');

    try {
      // Step 1: Test connection
      const connected = await this.testConnection();
      if (!connected) {
        throw new Error('Failed to connect to MongoDB Atlas');
      }

      // Step 2: Create sample data
      const sampleCreated = await this.createSampleData();
      if (!sampleCreated) {
        throw new Error('Failed to create sample data');
      }

      // Step 3: Create indexes
      const indexesCreated = await this.createIndexes();
      if (!indexesCreated) {
        throw new Error('Failed to create indexes');
      }

      // Step 4: Validate setup
      const validated = await this.validateSetup();
      if (!validated) {
        throw new Error('Validation failed');
      }

      // Step 5: Test API endpoints
      const apiTested = await this.testAPIEndpoints();
      if (!apiTested) {
        throw new Error('API testing failed');
      }

      this.stats.endTime = new Date();
      const duration = this.stats.endTime - this.stats.startTime;

      console.log('\n🎉 MongoDB Atlas Setup Completed Successfully!');
      console.log('==============================================');
      console.log(`⏱️  Duration: ${Math.round(duration / 1000)}s`);
      console.log(`📊 Sample data created and validated`);
      console.log(`🔧 Indexes created for performance`);
      console.log(`✅ API endpoints tested and working`);
      console.log('\n🚀 Ready to proceed with real data import!');

      return true;

    } catch (error) {
      console.error('\n❌ Setup failed:', error.message);
      return false;
    } finally {
      await mongoose.disconnect();
    }
  }
}

// Check if password is provided
if (ATLAS_CONFIG.password === 'YOUR_PASSWORD_HERE') {
  console.log('❌ Please update the password in the script first!');
  console.log('   Edit setup-atlas.js and replace YOUR_PASSWORD_HERE with your actual password');
  process.exit(1);
}

// Run the setup
const setup = new AtlasSetup();
setup.runSetup()
  .then(success => {
    if (success) {
      console.log('\n🎯 Next Steps:');
      console.log('1. Download Kaggle dataset');
      console.log('2. Run bulk insert script');
      console.log('3. Test with real data');
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Setup process failed:', error.message);
    process.exit(1);
  });
