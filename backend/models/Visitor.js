const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    ip: { type: String },
    userAgent: { type: String },
    page: { type: String },
    visitedAt: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } // If logged in
});

module.exports = mongoose.model('Visitor', visitorSchema);
