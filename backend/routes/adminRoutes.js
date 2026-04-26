const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Middleware to check if user is admin
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'عذراً، هذه الصلاحية للمدير فقط' });
    }
};

// @route   GET /api/admin/vendors
// @desc    Get all vendors
router.get('/vendors', auth, adminOnly, async (req, res) => {
    try {
        const vendors = await User.find({ role: 'vendor' }).select('-password').sort({ created_at: -1 });
        res.json(vendors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT /api/admin/vendors/:id/approve
// @desc    Approve a vendor
router.put('/vendors/:id/approve', auth, adminOnly, async (req, res) => {
    try {
        const vendor = await User.findById(req.params.id);
        if (!vendor) return res.status(404).json({ error: 'البائع غير موجود' });

        vendor.status = 'approved';
        await vendor.save();
        
        res.json({ message: 'تمت الموافقة على البائع بنجاح', vendor });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT /api/admin/vendors/:id/reject
// @desc    Reject a vendor
router.put('/vendors/:id/reject', auth, adminOnly, async (req, res) => {
    try {
        const vendor = await User.findById(req.params.id);
        if (!vendor) return res.status(404).json({ error: 'البائع غير موجود' });

        vendor.status = 'rejected';
        await vendor.save();
        
        res.json({ message: 'تم رفض البائع', vendor });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
