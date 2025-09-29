#!/usr/bin/env node

/**
 * Quick Fix Data Script
 * 
 * This script adds sample student and teacher data to a few schools for testing
 */

import mongoose from 'mongoose';
import School from './src/models/schoolModel.js';

// MongoDB Atlas connection
const connectionString = "mongodb+srv://ajv1520:ajmark321@schoolcluster.v1pfmoq.mongodb.net/udise-dashboard?retryWrites=true&w=majority&appName=SchoolCluster";

async function quickFixData() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB Atlas');

    // Get first 100 schools without student/teacher data
    const schools = await School.find({
      $or: [
        { total_students: { $exists: false } },
        { total_students: null },
        { total_students: 0 }
      ]
    }).limit(100);

    console.log(`📊 Found ${schools.length} schools to update`);

    if (schools.length === 0) {
      console.log('✅ All schools already have student/teacher data');
      return;
    }

    console.log('🔄 Adding sample student and teacher data...');
    
    // Update each school with sample data
    for (let i = 0; i < schools.length; i++) {
      const school = schools[i];
      
      // Generate realistic data based on school characteristics
      const baseStudents = Math.floor(Math.random() * 300) + 50; // 50-350 students
      const baseTeachers = Math.floor(baseStudents / 20) + 2; // 1:20 ratio + 2
      
      await School.findByIdAndUpdate(school._id, {
        total_students: baseStudents,
        total_teachers: baseTeachers,
        establishment_year: 1950 + Math.floor(Math.random() * 70), // 1950-2020
        contact_number: `9876${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        address: `Near ${school.village} Panchayat, ${school.block}, ${school.district}, ${school.state}`,
        pincode: (100000 + Math.floor(Math.random() * 900000)).toString(),
        school_category: school.school_category || 'All',
        school_status: school.school_status || 'Operational'
      });
      
      if ((i + 1) % 10 === 0) {
        console.log(`✅ Updated ${i + 1}/${schools.length} schools`);
      }
    }

    console.log(`🎉 Successfully updated ${schools.length} schools with sample data`);

    // Test the updated data
    const sampleSchool = await School.findOne({ total_students: { $gt: 0 } });
    if (sampleSchool) {
      console.log('\n📊 Sample updated school:');
      console.log(`   ${sampleSchool.school_name}`);
      console.log(`   Students: ${sampleSchool.total_students}`);
      console.log(`   Teachers: ${sampleSchool.total_teachers}`);
    }

  } catch (error) {
    console.error('❌ Error updating data:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
quickFixData()
  .then(() => {
    console.log('\n🎯 Data update completed!');
    console.log('Now test the frontend to see the student/teacher columns populated.');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  });


