import mongoose from 'mongoose';

// Test different connection string formats
const connectionStrings = [
  // Format 1: With appName
  "mongodb+srv://ajv1520:ajmark%40321@schoolcluster.v1pfmoq.mongodb.net/udise-dashboard?retryWrites=true&w=majority&appName=SchoolCluster",
  
  // Format 2: Without appName
  "mongodb+srv://ajv1520:ajmark%40321@schoolcluster.v1pfmoq.mongodb.net/udise-dashboard?retryWrites=true&w=majority",
  
  // Format 3: Simple format
  "mongodb+srv://ajv1520:ajmark%40321@schoolcluster.v1pfmoq.mongodb.net/udise-dashboard"
];

async function testConnection(connectionString, index) {
  try {
    console.log(`\n🔗 Testing Connection ${index + 1}:`);
    console.log(`   ${connectionString.substring(0, 50)}...`);
    
    await mongoose.connect(connectionString, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ Connection ${index + 1} successful!`);
    
    // Test a simple query
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`   Collections: ${collections.length}`);
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log(`❌ Connection ${index + 1} failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing MongoDB Atlas Connection...\n');
  
  for (let i = 0; i < connectionStrings.length; i++) {
    const success = await testConnection(connectionStrings[i], i);
    if (success) {
      console.log(`\n🎉 Found working connection string!`);
      console.log(`   Use this in your app: ${connectionStrings[i]}`);
      process.exit(0);
    }
  }
  
  console.log('\n❌ All connection attempts failed.');
  console.log('\n💡 Please check:');
  console.log('   1. Your password is correct');
  console.log('   2. Your IP is whitelisted in Atlas Network Access');
  console.log('   3. Your cluster is running');
  console.log('   4. Your database user has proper permissions');
  process.exit(1);
}

runTests();
