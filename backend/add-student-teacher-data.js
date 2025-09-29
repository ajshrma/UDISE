#!/usr/bin/env node

/**
 * Add Student and Teacher Data Script
 * 
 * This script adds realistic student and teacher count data to existing schools
 * since the Kaggle dataset doesn't include this information
 */

import mongoose from 'mongoose';
import School from './src/models/schoolModel.js';

// MongoDB Atlas connection
const connectionString = "mongodb+srv://ajv1520:ajmark321@schoolcluster.v1pfmoq.mongodb.net/udise-dashboard?retryWrites=true&w=majority&appName=SchoolCluster";

// Function to generate realistic student count based on school characteristics
function generateStudentCount(school) {
  const baseCount = {
    'Primary': 80,
    'Upper Primary': 120,
    'Secondary': 200,
    'Higher Secondary': 300,
    'All': 250
  };
  
  const managementMultiplier = {
    'Government': 1.0,
    'Private Unaided': 0.8,
    'Aided': 0.9,
    'Central Government': 1.2
  };
  
  const locationMultiplier = {
    'Rural': 0.7,
    'Urban': 1.3
  };
  
  const schoolTypeMultiplier = {
    'Co-Ed': 1.0,
    'Girls': 0.8,
    'Boys': 0.8
  };
  
  const base = baseCount[school.school_category] || 150;
  const management = managementMultiplier[school.management_type] || 1.0;
  const location = locationMultiplier[school.location] || 1.0;
  const type = schoolTypeMultiplier[school.school_type] || 1.0;
  
  // Add some randomness (±20%)
  const randomFactor = 0.8 + (Math.random() * 0.4);
  
  return Math.round(base * management * location * type * randomFactor);
}

// Function to generate realistic teacher count based on student count
function generateTeacherCount(studentCount) {
  // Teacher-student ratio varies by school type
  const ratios = [15, 18, 20, 22, 25]; // Different ratios
  const ratio = ratios[Math.floor(Math.random() * ratios.length)];
  
  const teacherCount = Math.ceil(studentCount / ratio);
  
  // Ensure minimum teachers
  return Math.max(teacherCount, 2);
}

// Function to generate establishment year
function generateEstablishmentYear() {
  // Most schools established between 1950-2020
  const startYear = 1950;
  const endYear = 2020;
  return startYear + Math.floor(Math.random() * (endYear - startYear + 1));
}

// Function to generate contact number
function generateContactNumber() {
  const prefixes = ['9876', '8765', '7654', '6543', '5432', '4321'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return prefix + suffix;
}

// Function to generate pincode
function generatePincode() {
  return Math.floor(Math.random() * 900000) + 100000;
}

// Function to generate address
function generateAddress(school) {
  return `Near ${school.village} Panchayat, ${school.block}, ${school.district}, ${school.state}`;
}

async function addStudentTeacherData() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB Atlas');

    // Get all schools that don't have student/teacher data
    const schoolsWithoutData = await School.find({
      $or: [
        { total_students: { $exists: false } },
        { total_students: null },
        { total_students: 0 },
        { total_teachers: { $exists: false } },
        { total_teachers: null },
        { total_teachers: 0 }
      ]
    });

    console.log(`📊 Found ${schoolsWithoutData.length} schools without student/teacher data`);

    if (schoolsWithoutData.length === 0) {
      console.log('✅ All schools already have student/teacher data');
      return;
    }

    console.log('🔄 Adding student and teacher data...');
    
    let updatedCount = 0;
    const batchSize = 100;
    
    // Process in batches
    for (let i = 0; i < schoolsWithoutData.length; i += batchSize) {
      const batch = schoolsWithoutData.slice(i, i + batchSize);
      
      const updatePromises = batch.map(async (school) => {
        const studentCount = generateStudentCount(school);
        const teacherCount = generateTeacherCount(studentCount);
        
        return School.findByIdAndUpdate(school._id, {
          total_students: studentCount,
          total_teachers: teacherCount,
          establishment_year: school.establishment_year || generateEstablishmentYear(),
          contact_number: school.contact_number || generateContactNumber(),
          address: school.address || generateAddress(school),
          pincode: school.pincode || generatePincode().toString(),
          school_category: school.school_category || 'All',
          school_status: school.school_status || 'Operational',
          cluster: school.cluster || `Cluster ${Math.floor(Math.random() * 100)}`,
          serial_no: school.serial_no || Math.floor(Math.random() * 10000)
        });
      });
      
      await Promise.all(updatePromises);
      updatedCount += batch.length;
      
      console.log(`✅ Updated batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(schoolsWithoutData.length / batchSize)} (${updatedCount} schools)`);
    }

    console.log(`🎉 Successfully updated ${updatedCount} schools with student/teacher data`);

    // Validate the update
    const sampleSchools = await School.find({ total_students: { $gt: 0 } }).limit(5);
    console.log('\n📊 Sample updated schools:');
    sampleSchools.forEach(school => {
      console.log(`   ${school.school_name}: ${school.total_students} students, ${school.total_teachers} teachers`);
    });

    // Get statistics
    const totalSchools = await School.countDocuments();
    const schoolsWithData = await School.countDocuments({ 
      total_students: { $gt: 0 }, 
      total_teachers: { $gt: 0 } 
    });
    
    console.log('\n📈 Final Statistics:');
    console.log(`   Total Schools: ${totalSchools}`);
    console.log(`   Schools with Student/Teacher Data: ${schoolsWithData}`);
    console.log(`   Coverage: ${Math.round((schoolsWithData / totalSchools) * 100)}%`);

  } catch (error) {
    console.error('❌ Error adding student/teacher data:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
addStudentTeacherData()
  .then(() => {
    console.log('\n🎯 Next Steps:');
    console.log('1. Test the updated data in the frontend');
    console.log('2. Verify student/teacher columns are now populated');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  });
