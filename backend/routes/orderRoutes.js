const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const multer = require('multer');
const path = require('path');

const { storage } = require('../config/cloudinary');
const upload = multer({ storage: storage });

// Checkout (Create Order)
router.post('/', upload.single('transaction_image'), async (req, res) => {
    try {
        const { 
            customer_name, 
            customer_phone, 
            customer_address, 
            items, // Array of { product_id, quantity }
            payment_method, 
            sender_phone, 
            transaction_id,
            latitude,
            longitude
        } = req.body;

        // Parse items if they come as a string (from FormData)
        const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;

        if (!parsedItems || parsedItems.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Find or create customer
        let customer = await Customer.findOne({ phone: customer_phone });
        if (!customer) {
            customer = new Customer({ 
                name: customer_name, 
                phone: customer_phone, 
                address: customer_address,
                latitude: latitude ? parseFloat(latitude) : undefined,
                longitude: longitude ? parseFloat(longitude) : undefined
            });
            await customer.save();
        } else if (latitude && longitude) {
            // Update existing customer location
            customer.address = customer_address;
            customer.latitude = parseFloat(latitude);
            customer.longitude = parseFloat(longitude);
            await customer.save();
        }

        let total_price = 0;
        let total_cost = 0;
        const finalizedItems = [];

        // Process each item in the cart
        for (const item of parsedItems) {
            const product = await Product.findById(item.product_id);
            if (!product) {
                return res.status(404).json({ error: `Product ${item.product_id} not found` });
            }
            
            const qty = parseInt(item.quantity);
            if (product.quantity < qty) {
                return res.status(400).json({ error: `Not enough stock for ${product.name}` });
            }

            // Reduce stock
            product.quantity -= qty;
            await product.save();

            // Calculate totals
            total_price += product.price * qty;
            total_cost += product.cost_price * qty;

            finalizedItems.push({
                product_id: product._id,
                quantity: qty,
                price: product.price
            });
        }

        const profit = total_price - total_cost;

        // Process payment info
        let transaction_image = null;
        if (req.file) {
            transaction_image = req.file.path;
        }
        
        let payment_status = 'pending';
        if (payment_method === 'paypal' && transaction_id) {
            payment_status = 'paid';
        }

        // Create Order
        const order = new Order({
            customer_id: customer._id,
            items: finalizedItems,
            total_price,
            total_cost,
            profit,
            payment_method,
            payment_status,
            sender_phone,
            transaction_image,
            transaction_id,
            latitude: latitude ? parseFloat(latitude) : undefined,
            longitude: longitude ? parseFloat(longitude) : undefined
        });
        await order.save();

        res.status(201).json({ message: 'Order placed successfully', order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('customer_id')
            .populate('items.product_id')
            .sort({ date: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Approve Payment
router.patch('/:id/approve', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        
        order.payment_status = 'paid';
        await order.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
