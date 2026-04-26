const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Secret for JWT (In production, move to .env)
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123';

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    try {
        const { name, username, whatsapp, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ error: 'اسم المستخدم موجود مسبقاً' });
        }

        user = new User({ name, username, whatsapp, password });
        await user.save();

        // Create token only if not pending (like admin), but let's just make them wait if they are vendor.
        if (user.role === 'vendor') {
            return res.status(201).json({
                message: 'تم تسجيل الحساب بنجاح. حسابك قيد المراجعة من قبل الإدارة.',
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                    role: user.role,
                    status: user.status
                }
            });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'بيانات الدخول غير صحيحة' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'بيانات الدخول غير صحيحة' });
        }

        // Check approval status
        if (user.role === 'vendor') {
            if (user.status === 'pending') {
                return res.status(403).json({ error: 'حسابك قيد المراجعة من قبل الإدارة' });
            }
            if (user.status === 'rejected') {
                return res.status(403).json({ error: 'تم رفض حسابك من قبل الإدارة' });
            }
        }

        // Create token
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
