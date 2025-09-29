import fs from 'fs';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';

// Data processing utility for Kaggle UDISE dataset
class DataProcessor {
  constructor() {
    this.processedData = [];
    this.errors = [];
  }

  // Clean and standardize data
  cleanData(rawData) {
    return rawData.map((record, index) => {
      try {
        // Clean and standardize the data
        const cleaned = {
          udise_code: this.cleanString(record.udise_code || record.UDISE_CODE || ''),
          school_name: this.cleanString(record.school_name || record.SCHOOL_NAME || record.School_Name || ''),
          state: this.cleanString(record.state || record.STATE || record.State || ''),
          district: this.cleanString(record.district || record.DISTRICT || record.District || ''),
          block: this.cleanString(record.block || record.BLOCK || record.Block || ''),
          village: this.cleanString(record.village || record.VILLAGE || record.Village || ''),
          management_type: this.standardizeManagementType(record.management_type || record.MANAGEMENT_TYPE || record.Management_Type || ''),
          location: this.standardizeLocation(record.location || record.LOCATION || record.Location || ''),
          school_type: this.standardizeSchoolType(record.school_type || record.SCHOOL_TYPE || record.School_Type || ''),
          total_students: this.cleanNumber(record.total_students || record.TOTAL_STUDENTS || record.Total_Students || 0),
          total_teachers: this.cleanNumber(record.total_teachers || record.TOTAL_TEACHERS || record.Total_Teachers || 0),
          establishment_year: this.cleanNumber(record.establishment_year || record.ESTABLISHMENT_YEAR || record.Establishment_Year || null),
          school_category: this.standardizeSchoolCategory(record.school_category || record.SCHOOL_CATEGORY || record.School_Category || ''),
          contact_number: this.cleanString(record.contact_number || record.CONTACT_NUMBER || record.Contact_Number || ''),
          email: this.cleanString(record.email || record.EMAIL || record.Email || ''),
          address: this.cleanString(record.address || record.ADDRESS || record.Address || ''),
          pincode: this.cleanString(record.pincode || record.PINCODE || record.Pincode || ''),
          coordinates: {
            latitude: this.cleanNumber(record.latitude || record.LATITUDE || record.Latitude || null),
            longitude: this.cleanNumber(record.longitude || record.LONGITUDE || record.Longitude || null),
          },
          is_active: true,
          last_updated: new Date(),
        };

        // Validate required fields
        if (!cleaned.udise_code || !cleaned.school_name || !cleaned.state || !cleaned.district) {
          throw new Error(`Missing required fields at record ${index + 1}`);
        }

        return cleaned;
      } catch (error) {
        this.errors.push({
          index: index + 1,
          error: error.message,
          record: record
        });
        return null;
      }
    }).filter(record => record !== null);
  }

  // Clean string values
  cleanString(value) {
    if (!value || value === 'null' || value === 'NULL' || value === '') return '';
    return String(value).trim().replace(/\s+/g, ' ');
  }

  // Clean number values
  cleanNumber(value) {
    if (!value || value === 'null' || value === 'NULL' || value === '') return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  // Standardize management type
  standardizeManagementType(value) {
    const managementTypes = {
      'Government': 'Government',
      'Private Unaided': 'Private Unaided',
      'Private Aided': 'Aided',
      'Aided': 'Aided',
      'Central Government': 'Central Government',
      'Other': 'Other',
      'govt': 'Government',
      'private': 'Private Unaided',
      'aided': 'Aided',
    };

    const cleanValue = this.cleanString(value).toLowerCase();
    for (const [key, standard] of Object.entries(managementTypes)) {
      if (cleanValue.includes(key.toLowerCase())) {
        return standard;
      }
    }
    return 'Government'; // Default fallback
  }

  // Standardize location
  standardizeLocation(value) {
    const cleanValue = this.cleanString(value).toLowerCase();
    if (cleanValue.includes('rural')) return 'Rural';
    if (cleanValue.includes('urban')) return 'Urban';
    return 'Rural'; // Default fallback
  }

  // Standardize school type
  standardizeSchoolType(value) {
    const cleanValue = this.cleanString(value).toLowerCase();
    if (cleanValue.includes('girls') || cleanValue.includes('girl')) return 'Girls';
    if (cleanValue.includes('boys') || cleanValue.includes('boy')) return 'Boys';
    if (cleanValue.includes('co-ed') || cleanValue.includes('coed') || cleanValue.includes('mixed')) return 'Co-Ed';
    return 'Co-Ed'; // Default fallback
  }

  // Standardize school category
  standardizeSchoolCategory(value) {
    const cleanValue = this.cleanString(value).toLowerCase();
    if (cleanValue.includes('primary')) return 'Primary';
    if (cleanValue.includes('upper primary')) return 'Upper Primary';
    if (cleanValue.includes('secondary')) return 'Secondary';
    if (cleanValue.includes('higher secondary')) return 'Higher Secondary';
    return 'All'; // Default fallback
  }

  // Process CSV file
  async processCSV(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(inputPath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          console.log(`📊 Processed ${results.length} raw records`);
          
          // Clean the data
          const cleanedData = this.cleanData(results);
          console.log(`✅ Cleaned ${cleanedData.length} records`);
          console.log(`❌ ${this.errors.length} records had errors`);
          
          // Save processed data
          this.saveProcessedData(cleanedData, outputPath);
          
          resolve({
            totalRecords: results.length,
            cleanedRecords: cleanedData.length,
            errorRecords: this.errors.length,
            errors: this.errors
          });
        })
        .on('error', reject);
    });
  }

  // Save processed data to CSV
  saveProcessedData(data, outputPath) {
    const csvWriter = createObjectCsvWriter({
      path: outputPath,
      header: [
        { id: 'udise_code', title: 'udise_code' },
        { id: 'school_name', title: 'school_name' },
        { id: 'state', title: 'state' },
        { id: 'district', title: 'district' },
        { id: 'block', title: 'block' },
        { id: 'village', title: 'village' },
        { id: 'management_type', title: 'management_type' },
        { id: 'location', title: 'location' },
        { id: 'school_type', title: 'school_type' },
        { id: 'total_students', title: 'total_students' },
        { id: 'total_teachers', title: 'total_teachers' },
        { id: 'establishment_year', title: 'establishment_year' },
        { id: 'school_category', title: 'school_category' },
        { id: 'contact_number', title: 'contact_number' },
        { id: 'email', title: 'email' },
        { id: 'address', title: 'address' },
        { id: 'pincode', title: 'pincode' },
        { id: 'coordinates.latitude', title: 'latitude' },
        { id: 'coordinates.longitude', title: 'longitude' },
      ]
    });

    csvWriter.writeRecords(data)
      .then(() => {
        console.log(`💾 Processed data saved to ${outputPath}`);
      })
      .catch(console.error);
  }

  // Get processing statistics
  getStats() {
    return {
      totalProcessed: this.processedData.length,
      errors: this.errors.length,
      errorRate: (this.errors.length / (this.processedData.length + this.errors.length)) * 100
    };
  }
}

export default DataProcessor;
