const mongoose = require('mongoose');

const connectDB = async () => {
    const MONGO_URI = process.env.MONGO_URI;
    if (MONGO_URI && !MONGO_URI.includes('<db_password>')) {
        try {
            await mongoose.connect(MONGO_URI);
            console.log('✅ Connected to MongoDB Atlas');
        } catch (err) {
            console.error('❌ MongoDB Connection Error:', err);
            process.exit(1);
        }
    } else {
        console.warn('⚠️ MongoDB connection string missing or password not set in .env');
    }
};

module.exports = connectDB;
