#!/usr/bin/env node

/**
 * Generate Sample Data Script
 * 
 * This script generates a larger sample dataset for testing
 * with realistic Indian school data
 */

import mongoose from 'mongoose';
import School from './src/models/schoolModel.js';

// MongoDB Atlas connection
const connectionString = "mongodb+srv://ajv1520:ajmark321@schoolcluster.v1pfmoq.mongodb.net/udise-dashboard?retryWrites=true&w=majority&appName=SchoolCluster";

// Sample data templates
const states = [
  'Madhya Pradesh', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh',
  'Gujarat', 'Rajasthan', 'West Bengal', 'Bihar', 'Andhra Pradesh'
];

const districts = {
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirapalli', 'Salem'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia'],
  'Andhra Pradesh': ['Hyderabad', 'Vijayawada', 'Visakhapatnam', 'Guntur', 'Nellore']
};

const blocks = ['Block A', 'Block B', 'Block C', 'Block D', 'Block E'];
const villages = ['Village 1', 'Village 2', 'Village 3', 'Village 4', 'Village 5'];
const managementTypes = ['Government', 'Private Unaided', 'Aided', 'Central Government'];
const locations = ['Rural', 'Urban'];
const schoolTypes = ['Co-Ed', 'Girls', 'Boys'];
const schoolCategories = ['Primary', 'Secondary', 'Higher Secondary', 'All'];

function generateUDISECode(stateIndex, districtIndex, schoolIndex) {
  const stateCode = String(stateIndex + 1).padStart(2, '0');
  const districtCode = String(districtIndex + 1).padStart(2, '0');
  const schoolCode = String(schoolIndex + 1).padStart(3, '0');
  return `${stateCode}${districtCode}${schoolCode}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
}

function generateSchoolName(managementType, schoolType, location, index) {
  const prefixes = {
    'Government': ['Government', 'Municipal', 'Zilla Parishad'],
    'Private Unaided': ['St. Mary\'s', 'St. Joseph\'s', 'Delhi Public', 'DPS', 'Chinmaya'],
    'Aided': ['Aided School', 'Grant-in-Aid', 'Subsidized'],
    'Central Government': ['Kendriya Vidyalaya', 'Central School', 'Navodaya']
  };
  
  const suffixes = {
    'Primary': ['Primary School', 'Elementary School'],
    'Secondary': ['High School', 'Secondary School'],
    'Higher Secondary': ['Higher Secondary School', 'Senior Secondary'],
    'All': ['School', 'Vidyalaya', 'Academy']
  };
  
  const prefix = prefixes[managementType][Math.floor(Math.random() * prefixes[managementType].length)];
  const suffix = suffixes[schoolCategories[Math.floor(Math.random() * schoolCategories.length)]][Math.floor(Math.random() * 2)];
  
  return `${prefix} ${suffix} ${index}`;
}

function generateContactNumber() {
  const prefixes = ['9876', '8765', '7654', '6543', '5432'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return prefix + suffix;
}

function generatePincode() {
  return Math.floor(Math.random() * 900000) + 100000;
}

function generateAddress(village, block, district, state) {
  return `Near ${village} Panchayat, ${block}, ${district}, ${state}`;
}

async function generateSampleData() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await School.deleteMany({});
    console.log('✅ Existing data cleared');

    console.log('📊 Generating sample data...');
    const schools = [];
    let schoolIndex = 0;

    // Generate 1000 schools across different states
    for (let stateIndex = 0; stateIndex < states.length; stateIndex++) {
      const state = states[stateIndex];
      const stateDistricts = districts[state];
      
      for (let districtIndex = 0; districtIndex < stateDistricts.length; districtIndex++) {
        const district = stateDistricts[districtIndex];
        const schoolsPerDistrict = Math.floor(Math.random() * 20) + 10; // 10-30 schools per district
        
        for (let i = 0; i < schoolsPerDistrict; i++) {
          const managementType = managementTypes[Math.floor(Math.random() * managementTypes.length)];
          const location = locations[Math.floor(Math.random() * locations.length)];
          const schoolType = schoolTypes[Math.floor(Math.random() * schoolTypes.length)];
          const schoolCategory = schoolCategories[Math.floor(Math.random() * schoolCategories.length)];
          const block = blocks[Math.floor(Math.random() * blocks.length)];
          const village = villages[Math.floor(Math.random() * villages.length)];
          
          const school = {
            udise_code: generateUDISECode(stateIndex, districtIndex, schoolIndex),
            school_name: generateSchoolName(managementType, schoolType, location, schoolIndex + 1),
            state,
            district,
            block,
            village,
            management_type: managementType,
            location,
            school_type: schoolType,
            school_category: schoolCategory,
            total_students: Math.floor(Math.random() * 500) + 50,
            total_teachers: Math.floor(Math.random() * 25) + 5,
            establishment_year: Math.floor(Math.random() * 50) + 1970,
            contact_number: generateContactNumber(),
            address: generateAddress(village, block, district, state),
            pincode: generatePincode().toString(),
            is_active: Math.random() > 0.1 // 90% active
          };
          
          schools.push(school);
          schoolIndex++;
          
          if (schools.length >= 1000) break;
        }
        if (schools.length >= 1000) break;
      }
      if (schools.length >= 1000) break;
    }

    console.log(`📝 Generated ${schools.length} schools`);
    console.log('💾 Inserting into database...');

    // Insert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < schools.length; i += batchSize) {
      const batch = schools.slice(i, i + batchSize);
      await School.insertMany(batch);
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(schools.length / batchSize)}`);
    }

    console.log('🔧 Creating indexes...');
    await School.syncIndexes();

    // Validate data
    const totalSchools = await School.countDocuments();
    const statesCount = await School.distinct('state');
    const managementTypesCount = await School.distinct('management_type');
    
    console.log('\n📊 Data Validation Results:');
    console.log(`   Total Schools: ${totalSchools}`);
    console.log(`   States: ${statesCount.length}`);
    console.log(`   Management Types: ${managementTypesCount.length}`);
    
    // Show distribution
    const managementDistribution = await School.aggregate([
      { $group: { _id: '$management_type', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📈 Management Type Distribution:');
    managementDistribution.forEach(item => {
      console.log(`   ${item._id}: ${item.count}`);
    });

    console.log('\n🎉 Sample data generation completed successfully!');
    console.log('✅ Ready for testing with realistic data');

  } catch (error) {
    console.error('❌ Error generating sample data:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

generateSampleData();
