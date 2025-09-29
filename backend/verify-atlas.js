import mongoose from 'mongoose';

console.log('🔍 MongoDB Atlas Connection Verification');
console.log('=====================================\n');

console.log('📋 Connection Details:');
console.log('   Username: ajv1520');
console.log('   Password: ajmark@321');
console.log('   Cluster: schoolcluster.v1pfmoq.mongodb.net');
console.log('   Database: udise-dashboard\n');

console.log('🔧 Troubleshooting Steps:');
console.log('1. Check Network Access in Atlas:');
console.log('   - Go to Network Access in Atlas dashboard');
console.log('   - Add your current IP address');
console.log('   - Or temporarily add 0.0.0.0/0 (allow all IPs)\n');

console.log('2. Check Database Access:');
console.log('   - Go to Database Access in Atlas dashboard');
console.log('   - Verify user ajv1520 exists');
console.log('   - Check password is correct');
console.log('   - Ensure user has proper permissions\n');

console.log('3. Check Cluster Status:');
console.log('   - Ensure your cluster is running');
console.log('   - Check if it\'s in the correct region\n');

console.log('4. Test Connection:');
console.log('   - Try connecting from Atlas Compass');
console.log('   - Use the connection string from Atlas dashboard\n');

console.log('💡 Quick Fixes:');
console.log('- Try adding 0.0.0.0/0 to Network Access (temporarily)');
console.log('- Reset the database user password');
console.log('- Check if the cluster is paused\n');

console.log('🚀 Once you fix the issues, run:');
console.log('   node setup-atlas.js');
