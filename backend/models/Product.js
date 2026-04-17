const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    cost_price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String }, // Path to the uploaded image
    description: { type: String },
    quantity: { type: Number, required: true, default: 0 },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
