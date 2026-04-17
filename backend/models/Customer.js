const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Customer', customerSchema);
