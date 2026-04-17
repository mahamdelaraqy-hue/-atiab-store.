const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');

const auth = require('../middleware/auth');

const { storage } = require('../config/cloudinary');
const upload = multer({ storage: storage });

// Create a Product (Vendor/Admin)
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const { name, price, cost_price, category, description, quantity } = req.body;
        const image = req.file ? req.file.path : '';

        const newProduct = new Product({
            name,
            price,
            cost_price,
            category,
            image,
            description,
            quantity,
            seller: req.user._id // Automatically link to current user
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Products (with Search and Filter)
router.get('/', async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (category) {
            query.category = category;
        }

        const products = await Product.find(query).sort({ created_at: -1 });
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Recent Products
router.get('/recent', async (req, res) => {
    try {
        const products = await Product.find().sort({ created_at: -1 }).limit(10);
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Edit Product Price
router.put('/:id/price', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        product.price = req.body.price;
        await product.save();
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Edit Product Image
router.put('/:id/image', upload.single('image'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
        
        product.image = req.file.path; // Cloudinary URL
        await product.save();
        
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
