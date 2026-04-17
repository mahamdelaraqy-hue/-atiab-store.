const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        await mongoose.connect(uri);
        console.log('MongoDB Connected Successfully');

        // Seed default categories if none exist
        const Category = require('../models/Category');
        const count = await Category.countDocuments();
        if (count === 0) {
            const defaults = ['عطور ملكية', 'زيوت نادرة', 'بخور وعود', 'إكسسوارات', 'هدايا فاخرة', 'عروض خاصة'];
            await Category.insertMany(defaults.map(name => ({ name })));
            console.log('Default categories seeded successfully');
        }
    } catch (error) {
        console.error('MongoDB connection error:', error);
        // Don't exit in production/serverless, just log
    }
};

module.exports = connectDB;
