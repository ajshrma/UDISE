import mongoose from 'mongoose';

// Test different password encodings
const passwordVariations = [
  'ajmark@321',           // Original
  'ajmark%40321',         // URL encoded @
  'ajmark%40%40321',      // Double encoded
  'ajmark%40321',         // Single encoded
];

async function testPassword(password, index) {
  try {
    console.log(`\n🔑 Testing Password ${index + 1}: ${password}`);
    
    const connectionString = `mongodb+srv://ajv1520:${password}@schoolcluster.v1pfmoq.mongodb.net/udise-dashboard?retryWrites=true&w=majority&appName=SchoolCluster`;
    
    await mongoose.connect(connectionString, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ Password ${index + 1} works!`);
    console.log(`   Connection string: ${connectionString}`);
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log(`❌ Password ${index + 1} failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🔍 Testing Password Variations...\n');
  
  for (let i = 0; i < passwordVariations.length; i++) {
    const success = await testPassword(passwordVariations[i], i);
    if (success) {
      console.log(`\n🎉 Found working password!`);
      process.exit(0);
    }
  }
  
  console.log('\n❌ All password variations failed.');
  console.log('\n💡 Please double-check:');
  console.log('   1. The password in Atlas Database Access');
  console.log('   2. The username is exactly "ajv1520"');
  console.log('   3. The user has proper permissions');
  console.log('   4. Try resetting the password in Atlas');
  process.exit(1);
}

runTests();
