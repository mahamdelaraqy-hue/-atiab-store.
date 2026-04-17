const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Order = require('../models/Order');

router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find().sort({ created_at: -1 });
        
        // Let's attach their total orders and spent amount
        let customersData = [];
        for (let customer of customers) {
            const customerOrders = await Order.find({ customer_id: customer._id });
            const totalSpent = customerOrders.reduce((sum, ord) => sum + ord.total_price, 0);
            
            customersData.push({
                _id: customer._id,
                name: customer.name,
                phone: customer.phone,
                orderCount: customerOrders.length,
                totalSpent: totalSpent
            });
        }

        res.status(200).json(customersData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
