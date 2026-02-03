const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

console.log('🔄 Attempting to connect to MongoDB Atlas...');
console.log(`📡 URI endpoint: ${MONGODB_URI.split('@')[1].split('/')[0]}`); // Log only domain for security

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ SUCCESS: Connected to MongoDB Atlas!');
        console.log(`📊 Database Name: ${mongoose.connection.name}`);
        console.log(`💻 Host: ${mongoose.connection.host}`);
        console.log('You are ready for production!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('❌ CONNECTION FAILED:', err.message);
        process.exit(1);
    });
