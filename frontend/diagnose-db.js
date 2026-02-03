const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 MongoDB Connection Diagnostics\n');
console.log('=====================================');

if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

// Parse URI to check format
try {
    const uriParts = MONGODB_URI.split('@');
    const authPart = uriParts[0].replace('mongodb+srv://', '');
    const hostPart = uriParts[1];

    console.log('📋 Connection Details:');
    console.log(`   Username: ${authPart.split(':')[0]}`);
    console.log(`   Host: ${hostPart.split('/')[0]}`);
    console.log(`   Database: ${hostPart.split('/')[1]?.split('?')[0] || 'default'}`);
    console.log('');
} catch (e) {
    console.error('⚠️  Could not parse MongoDB URI');
}

console.log('🔄 Attempting connection (30s timeout)...\n');

const options = {
    serverSelectionTimeoutMS: 30000, // 30 second timeout
    socketTimeoutMS: 45000,
};

const timeout = setTimeout(() => {
    console.error('\n❌ CONNECTION TIMEOUT (30 seconds)');
    console.error('\nPossible issues:');
    console.error('  1. Network/Firewall blocking MongoDB Atlas');
    console.error('  2. IP address not whitelisted in MongoDB Atlas');
    console.error('  3. Incorrect credentials');
    console.error('  4. MongoDB cluster is paused or deleted');
    console.error('\n💡 Solution: Check MongoDB Atlas dashboard at https://cloud.mongodb.com');
    process.exit(1);
}, 30000);

mongoose.connect(MONGODB_URI, options)
    .then(() => {
        clearTimeout(timeout);
        console.log('✅ SUCCESS: Connected to MongoDB Atlas!\n');
        console.log('Connection Info:');
        console.log(`   Database: ${mongoose.connection.name}`);
        console.log(`   Host: ${mongoose.connection.host}`);
        console.log(`   Port: ${mongoose.connection.port}`);
        console.log(`   Ready State: ${mongoose.connection.readyState}`);
        console.log('\n✨ Your database is ready for production!');
        process.exit(0);
    })
    .catch((err) => {
        clearTimeout(timeout);
        console.error('\n❌ CONNECTION FAILED\n');
        console.error('Error Details:');
        console.error(`   Type: ${err.name}`);
        console.error(`   Message: ${err.message}`);

        if (err.message.includes('authentication')) {
            console.error('\n💡 Authentication Issue: Check username/password in MongoDB Atlas');
        } else if (err.message.includes('ENOTFOUND')) {
            console.error('\n💡 DNS Issue: Cannot resolve MongoDB host. Check connection string.');
        } else if (err.message.includes('timeout')) {
            console.error('\n💡 Timeout Issue: Network or firewall blocking connection.');
            console.error('   - Add your IP to MongoDB Atlas whitelist (0.0.0.0/0 for all IPs)');
        }

        console.error('\n🔧 Next Steps:');
        console.error('   1. Go to https://cloud.mongodb.com');
        console.error('   2. Select your cluster → Network Access');
        console.error('   3. Add IP address: 0.0.0.0/0 (allow all)');
        console.error('   4. Database Access → Verify username/password');

        process.exit(1);
    });

// Handle connection events
mongoose.connection.on('connecting', () => {
    console.log('⏳ Connecting to MongoDB...');
});

mongoose.connection.on('connected', () => {
    console.log('🔗 Connected to MongoDB server');
});

mongoose.connection.on('error', (err) => {
    console.error('⚠️  MongoDB error:', err.message);
});
