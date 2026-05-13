const connectDB = require('./config/db');
require('dotenv').config();

const testConnection = async () => {
    try {
        console.log('Testing connection to:', process.env.MONGO_URI);
        await connectDB();
        console.log('SUCCESS: Connected to MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('FAILURE: Could not connect to MongoDB');
        console.error('Error Details:', error);
        process.exit(1);
    }
};

testConnection();
