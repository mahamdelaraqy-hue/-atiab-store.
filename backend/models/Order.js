const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    // Denormalized fields for easy display
    customer_name: { type: String },
    product_name: { type: String },
    items: [{
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    quantity: { type: Number, default: 1 }, // for simple single-product display
    total_price: { type: Number, required: true },
    total_cost: { type: Number, required: true },
    profit: { type: Number, required: true },
    payment_method: { type: String, enum: ['vodafone', 'instapay', 'paypal'], required: true },
    payment_status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
    sender_phone: { type: String },
    transaction_image: { type: String },
    transaction_id: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
