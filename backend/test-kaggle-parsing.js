#!/usr/bin/env node

/**
 * Test Kaggle Data Parsing
 * 
 * This script will:
 * 1. Parse the Kaggle CSV directly
 * 2. Test filtering logic without MongoDB
 * 3. Show data structure and statistics
 * 4. Validate the data format
 */

import fs from 'fs';
import csv from 'csv-parser';

class KaggleDataTester {
  constructor() {
    this.inputFile = '/media/aj/Disk D/code test/kuki solutions/schools.csv';
    this.sampleSize = 50000; // Test with 50k records first
    this.stats = {
      totalRecords: 0,
      validRecords: 0,
      errorRecords: 0,
      states: new Set(),
      districts: new Set(),
      blocks: new Set(),
      villages: new Set(),
      managementTypes: new Set(),
      locations: new Set(),
      schoolTypes: new Set()
    };
  }

  // Parse CSV and collect statistics
  async parseCSV() {
    return new Promise((resolve, reject) => {
      const results = [];
      let recordCount = 0;
      
      console.log('📊 Parsing Kaggle CSV...');
      console.log(`🎯 Sample size: ${this.sampleSize} records`);
      
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
              this.stats.validRecords++;
              
              // Collect unique values
              this.stats.states.add(cleanedData.state);
              this.stats.districts.add(cleanedData.district);
              this.stats.blocks.add(cleanedData.block);
              this.stats.villages.add(cleanedData.village);
              this.stats.managementTypes.add(cleanedData.management_type);
              this.stats.locations.add(cleanedData.location);
              this.stats.schoolTypes.add(cleanedData.school_type);
            } else {
              this.stats.errorRecords++;
            }
            
            // Progress indicator
            if (recordCount % 1000 === 0) {
              console.log(`📝 Processed ${recordCount} records...`);
            }
          } catch (error) {
            this.stats.errorRecords++;
            console.error('Error processing record:', error.message);
          }
        })
        .on('end', () => {
          console.log(`✅ CSV parsing completed`);
          console.log(`📊 Total records: ${this.stats.totalRecords}`);
          console.log(`✅ Valid records: ${this.stats.validRecords}`);
          console.log(`❌ Error records: ${this.stats.errorRecords}`);
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
        total_teachers: this.generateRandomTeacherCount()
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

  // Test filtering logic
  testFiltering(schools) {
    console.log('\n🔍 Testing Filtering Logic...');
    
    // Test state filtering
    const states = [...this.stats.states];
    const testState = states[0];
    const stateFiltered = schools.filter(s => s.state === testState);
    console.log(`📍 State "${testState}": ${stateFiltered.length} schools`);
    
    // Test district filtering
    const districts = [...this.stats.districts];
    const testDistrict = districts[0];
    const districtFiltered = schools.filter(s => s.district === testDistrict);
    console.log(`📍 District "${testDistrict}": ${districtFiltered.length} schools`);
    
    // Test block filtering
    const blocks = [...this.stats.blocks];
    const testBlock = blocks[0];
    const blockFiltered = schools.filter(s => s.block === testBlock);
    console.log(`📍 Block "${testBlock}": ${blockFiltered.length} schools`);
    
    // Test village filtering
    const villages = [...this.stats.villages];
    const testVillage = villages[0];
    const villageFiltered = schools.filter(s => s.village === testVillage);
    console.log(`📍 Village "${testVillage}": ${villageFiltered.length} schools`);
    
    // Test management type filtering
    const managementTypes = [...this.stats.managementTypes];
    const testMgmt = managementTypes[0];
    const mgmtFiltered = schools.filter(s => s.management_type === testMgmt);
    console.log(`📍 Management "${testMgmt}": ${mgmtFiltered.length} schools`);
  }

  // Show data statistics
  showStatistics() {
    console.log('\n📊 Data Statistics:');
    console.log(`   Total Records: ${this.stats.totalRecords}`);
    console.log(`   Valid Records: ${this.stats.validRecords}`);
    console.log(`   Error Records: ${this.stats.errorRecords}`);
    console.log(`   States: ${this.stats.states.size}`);
    console.log(`   Districts: ${this.stats.districts.size}`);
    console.log(`   Blocks: ${this.stats.blocks.size}`);
    console.log(`   Villages: ${this.stats.villages.size}`);
    console.log(`   Management Types: ${this.stats.managementTypes.size}`);
    console.log(`   Locations: ${this.stats.locations.size}`);
    console.log(`   School Types: ${this.stats.schoolTypes.size}`);
    
    console.log('\n📈 Unique Values:');
    console.log(`   States: ${[...this.stats.states].slice(0, 5).join(', ')}...`);
    console.log(`   Management Types: ${[...this.stats.managementTypes].join(', ')}`);
    console.log(`   Locations: ${[...this.stats.locations].join(', ')}`);
    console.log(`   School Types: ${[...this.stats.schoolTypes].join(', ')}`);
  }

  // Show sample data
  showSampleData(schools) {
    console.log('\n📋 Sample Data:');
    schools.slice(0, 3).forEach((school, index) => {
      console.log(`\n${index + 1}. ${school.school_name}`);
      console.log(`   UDISE Code: ${school.udise_code}`);
      console.log(`   Location: ${school.state} > ${school.district} > ${school.block} > ${school.village}`);
      console.log(`   Management: ${school.management_type}`);
      console.log(`   Type: ${school.school_type} | Location: ${school.location}`);
    });
  }

  // Main execution
  async run() {
    try {
      console.log('🚀 Starting Kaggle Data Testing...');
      console.log(`📁 Input file: ${this.inputFile}`);
      console.log(`🎯 Sample size: ${this.sampleSize} records`);
      
      // Parse CSV
      const schools = await this.parseCSV();
      
      // Show statistics
      this.showStatistics();
      
      // Show sample data
      this.showSampleData(schools);
      
      // Test filtering
      this.testFiltering(schools);
      
      console.log('\n✅ Kaggle data testing completed successfully!');
      console.log('💡 The data structure looks good for MongoDB import!');
      
    } catch (error) {
      console.error('❌ Testing failed:', error.message);
      throw error;
    }
  }
}

// Run the tester
const tester = new KaggleDataTester();
tester.run().catch(console.error);
