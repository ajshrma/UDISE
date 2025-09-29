import School from "../models/schoolModel.js";
import mongoose from "mongoose";

// Mock school data for testing
const mockSchools = [
  {
    udise_code: "MP001001",
    school_name: "Government Primary School",
    state: "Madhya Pradesh",
    district: "Bhopal",
    block: "Block A",
    village: "Village 1",
    management_type: "Government",
    location: "Rural",
    school_type: "Co-Ed",
    total_students: 150,
    total_teachers: 8,
    establishment_year: 1985,
    school_category: "Primary",
    contact_number: "9876543210",
    address: "Near Village Panchayat",
    pincode: "462001",
  },
  {
    udise_code: "MP001002",
    school_name: "Private High School",
    state: "Madhya Pradesh",
    district: "Bhopal",
    block: "Block A",
    village: "Village 2",
    management_type: "Private Unaided",
    location: "Urban",
    school_type: "Co-Ed",
    total_students: 300,
    total_teachers: 15,
    establishment_year: 1995,
    school_category: "All",
    contact_number: "9876543211",
    address: "Main Road, City Center",
    pincode: "462002",
  },
  {
    udise_code: "MP001003",
    school_name: "Girls Secondary School",
    state: "Madhya Pradesh",
    district: "Indore",
    block: "Block X",
    village: "Village X1",
    management_type: "Government",
    location: "Rural",
    school_type: "Girls",
    total_students: 200,
    total_teachers: 12,
    establishment_year: 1990,
    school_category: "Secondary",
    contact_number: "9876543212",
    address: "Near Bus Stand",
    pincode: "452001",
  },
  {
    udise_code: "MH001001",
    school_name: "Boys High School",
    state: "Maharashtra",
    district: "Mumbai",
    block: "Block 1",
    village: "Village M1",
    management_type: "Aided",
    location: "Urban",
    school_type: "Boys",
    total_students: 400,
    total_teachers: 20,
    establishment_year: 1980,
    school_category: "Higher Secondary",
    contact_number: "9876543213",
    address: "Marine Drive",
    pincode: "400001",
  },
  {
    udise_code: "KA001001",
    school_name: "Community School",
    state: "Karnataka",
    district: "Bangalore",
    block: "Block B1",
    village: "Village B1",
    management_type: "Private Unaided",
    location: "Rural",
    school_type: "Co-Ed",
    total_students: 180,
    total_teachers: 10,
    establishment_year: 2000,
    school_category: "All",
    contact_number: "9876543214",
    address: "Near IT Park",
    pincode: "560001",
  },
  {
    udise_code: "TN001001",
    school_name: "Central Government School",
    state: "Tamil Nadu",
    district: "Chennai",
    block: "Block C1",
    village: "Village C1",
    management_type: "Central Government",
    location: "Urban",
    school_type: "Co-Ed",
    total_students: 350,
    total_teachers: 18,
    establishment_year: 1975,
    school_category: "All",
    contact_number: "9876543215",
    address: "Near Railway Station",
    pincode: "600001",
  },
  {
    udise_code: "UP001001",
    school_name: "Rural Primary School",
    state: "Uttar Pradesh",
    district: "Lucknow",
    block: "Block L1",
    village: "Village L1",
    management_type: "Government",
    location: "Rural",
    school_type: "Co-Ed",
    total_students: 120,
    total_teachers: 6,
    establishment_year: 1992,
    school_category: "Primary",
    contact_number: "9876543216",
    address: "Village Center",
    pincode: "226001",
  },
  {
    udise_code: "GJ001001",
    school_name: "Gujarat Public School",
    state: "Gujarat",
    district: "Ahmedabad",
    block: "Block G1",
    village: "Village G1",
    management_type: "Government",
    location: "Urban",
    school_type: "Co-Ed",
    total_students: 280,
    total_teachers: 14,
    establishment_year: 1988,
    school_category: "All",
    contact_number: "9876543217",
    address: "Near Sabarmati River",
    pincode: "380001",
  },
  {
    udise_code: "RJ001001",
    school_name: "Rajasthan Girls School",
    state: "Rajasthan",
    district: "Jaipur",
    block: "Block R1",
    village: "Village R1",
    management_type: "Government",
    location: "Rural",
    school_type: "Girls",
    total_students: 160,
    total_teachers: 9,
    establishment_year: 1995,
    school_category: "Upper Primary",
    contact_number: "9876543218",
    address: "Near Pink City",
    pincode: "302001",
  },
  {
    udise_code: "WB001001",
    school_name: "West Bengal Model School",
    state: "West Bengal",
    district: "Kolkata",
    block: "Block W1",
    village: "Village W1",
    management_type: "Aided",
    location: "Urban",
    school_type: "Co-Ed",
    total_students: 320,
    total_teachers: 16,
    establishment_year: 1982,
    school_category: "All",
    contact_number: "9876543219",
    address: "Near Howrah Bridge",
    pincode: "700001",
  },
];

export const seedSchools = async () => {
  try {
    // Clear existing schools
    await School.deleteMany({});
    console.log("Cleared existing schools");

    // Insert mock data
    const schools = await School.insertMany(mockSchools);
    console.log(`Seeded ${schools.length} schools successfully`);

    return schools;
  } catch (error) {
    console.error("Error seeding schools:", error);
    throw error;
  }
};

// Function to seed data (can be called from command line)
export const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await seedSchools();
    console.log("Seeding completed successfully");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed();
}
