const Visitor = require('../models/Visitor');

const tracker = async (req, res, next) => {
    try {
        // Skip logging for API requests if you only want page views, 
        // or keep for full analytics. Let's log unique paths.
        if (req.method === 'GET' && !req.url.startsWith('/api') && !req.url.includes('.')) {
            const visitorData = {
                ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                userAgent: req.headers['user-agent'],
                page: req.originalUrl || req.url,
                user: req.user?._id || null // If auth middleware already set req.user
            };

            // Non-blocking save
            Visitor.create(visitorData).catch(err => console.error('Tracker Error:', err));
        }
    } catch (e) {
        // Silently fail to not block the request
    }
    next();
};

module.exports = tracker;
