import axios from "axios";

const BASE_URL = "http://localhost:5000/api/v1";

// Test data
const testSchool = {
  udise_code: "TEST001",
  school_name: "Test School",
  state: "Test State",
  district: "Test District",
  block: "Test Block",
  village: "Test Village",
  management_type: "Government",
  location: "Rural",
  school_type: "Co-Ed",
  total_students: 100,
  total_teachers: 5,
  establishment_year: 2020,
  school_category: "Primary",
  contact_number: "1234567890",
  address: "Test Address",
  pincode: "123456",
};

// Test functions
const testGetAllSchools = async () => {
  try {
    console.log("Testing GET /schools...");
    const response = await axios.get(`${BASE_URL}/schools`);
    console.log("✅ GET /schools successful:", response.data);
    return response.data.data.schools[0]?._id; // Return first school ID for other tests
  } catch (error) {
    console.error("❌ GET /schools failed:", error.response?.data || error.message);
    return null;
  }
};

const testGetDistributionData = async () => {
  try {
    console.log("Testing GET /schools/distribution...");
    const response = await axios.get(`${BASE_URL}/schools/distribution`);
    console.log("✅ GET /schools/distribution successful:", response.data);
  } catch (error) {
    console.error("❌ GET /schools/distribution failed:", error.response?.data || error.message);
  }
};

const testGetFilterOptions = async () => {
  try {
    console.log("Testing GET /schools/filters?type=states...");
    const response = await axios.get(`${BASE_URL}/schools/filters?type=states`);
    console.log("✅ GET /schools/filters successful:", response.data);
  } catch (error) {
    console.error("❌ GET /schools/filters failed:", error.response?.data || error.message);
  }
};

const testCreateSchool = async () => {
  try {
    console.log("Testing POST /schools...");
    const response = await axios.post(`${BASE_URL}/schools`, testSchool);
    console.log("✅ POST /schools successful:", response.data);
    return response.data.data._id;
  } catch (error) {
    console.error("❌ POST /schools failed:", error.response?.data || error.message);
    return null;
  }
};

const testGetSchoolById = async (schoolId) => {
  if (!schoolId) {
    console.log("⏭️ Skipping GET /schools/:id (no school ID)");
    return;
  }
  
  try {
    console.log(`Testing GET /schools/${schoolId}...`);
    const response = await axios.get(`${BASE_URL}/schools/${schoolId}`);
    console.log("✅ GET /schools/:id successful:", response.data);
  } catch (error) {
    console.error("❌ GET /schools/:id failed:", error.response?.data || error.message);
  }
};

const testUpdateSchool = async (schoolId) => {
  if (!schoolId) {
    console.log("⏭️ Skipping PUT /schools/:id (no school ID)");
    return;
  }
  
  try {
    console.log(`Testing PUT /schools/${schoolId}...`);
    const response = await axios.put(`${BASE_URL}/schools/${schoolId}`, {
      school_name: "Updated Test School",
      total_students: 150,
    });
    console.log("✅ PUT /schools/:id successful:", response.data);
  } catch (error) {
    console.error("❌ PUT /schools/:id failed:", error.response?.data || error.message);
  }
};

const testDeleteSchool = async (schoolId) => {
  if (!schoolId) {
    console.log("⏭️ Skipping DELETE /schools/:id (no school ID)");
    return;
  }
  
  try {
    console.log(`Testing DELETE /schools/${schoolId}...`);
    const response = await axios.delete(`${BASE_URL}/schools/${schoolId}`);
    console.log("✅ DELETE /schools/:id successful:", response.data);
  } catch (error) {
    console.error("❌ DELETE /schools/:id failed:", error.response?.data || error.message);
  }
};

// Run all tests
const runTests = async () => {
  console.log("🚀 Starting API Tests...\n");
  
  // Test public endpoints first
  await testGetAllSchools();
  await testGetDistributionData();
  await testGetFilterOptions();
  
  // Test CRUD operations
  const schoolId = await testCreateSchool();
  await testGetSchoolById(schoolId);
  await testUpdateSchool(schoolId);
  await testDeleteSchool(schoolId);
  
  console.log("\n🏁 API Tests completed!");
};

// Run tests
runTests().catch(console.error);
