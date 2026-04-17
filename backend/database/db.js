 /* انسخ الكود ده وحطه في db.js جوه backend/database */
const mongoose = require('mongoose');

// متغير لحفظ حالة الاتصال ومنع التكرار (مهم جداً لـ Vercel)
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        console.log('Using existing MongoDB connection');
        return;
    }

    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('❌ MONGODB_URI is missing in Vercel environment variables!');
            return;
        }

        const db = await mongoose.connect(uri);
        isConnected = db.connections[0].readyState;
        console.log('✅ MongoDB Connected Successfully to Cloud');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
    }
};

module.exports = connectDB;
