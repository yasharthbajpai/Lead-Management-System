const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB connection...');
console.log(`Attempting to connect to: ${process.env.MONGODB_URI || 'No MongoDB URI found in environment variables'}`);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lead-conversion-system')
  .then(() => {
    console.log('✅ Successfully connected to MongoDB!');
    console.log('Connection details:');
    console.log(`- Host: ${mongoose.connection.host}`);
    console.log(`- Database name: ${mongoose.connection.name}`);
    console.log(`- Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected'}`);
    // Close the connection after successful test
    return mongoose.disconnect();
  })
  .then(() => {
    console.log('Connection closed.');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }); 