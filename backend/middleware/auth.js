const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123';

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'يرجى تسجيل الدخول أولاً' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            throw new Error();
        }

        if (user.role === 'vendor') {
            if (user.status === 'pending') {
                return res.status(403).json({ error: 'حسابك قيد المراجعة من قبل الإدارة' });
            }
            if (user.status === 'rejected') {
                return res.status(403).json({ error: 'تم رفض حسابك من قبل الإدارة' });
            }
        }

        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(401).json({ error: 'جلسة العمل انتهت، يرجى تسجيل الدخول مجدداً' });
    }
};

module.exports = auth;
