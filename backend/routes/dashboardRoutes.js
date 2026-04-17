const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

const Visitor = require('../models/Visitor');

router.get('/stats', async (req, res) => {
    try {
        const statsArray = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$total_price' },
                    totalCost: { $sum: '$total_cost' },
                    netProfit: { $sum: '$profit' }
                }
            }
        ]);
        
        let stats = { totalSales: 0, totalCost: 0, netProfit: 0 };
        if (statsArray.length > 0) {
            stats = statsArray[0];
            delete stats._id;
        }

        // Add Total Visitors Count
        const totalVisitors = await Visitor.countDocuments();
        stats.totalVisitors = totalVisitors;

        // Daily aggregated sales for the chart
        const dailyStats = await Order.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    sales: { $sum: '$total_price' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({ stats, dailyStats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Detailed Visitors Log
router.get('/visitors', async (req, res) => {
    try {
        const visitors = await Visitor.find()
            .sort({ visitedAt: -1 })
            .limit(100);
        res.json(visitors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
