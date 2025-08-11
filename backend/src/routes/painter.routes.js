const express = require('express');
const { requireAuth, requireApprovedPainter } = require('../middleware/auth');
const Painter = require('../models/painter.model');
const Offer = require('../models/offer.model');
const Transaction = require('../models/transaction.model');

const router = express.Router();

router.get('/leaderboard', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const painters = await Painter.find({ status: 'approved' })
      .sort({ totalCommission: -1 })
      .limit(limit)
      .select('name phone totalCommission approvedAt');
    res.json(painters);
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, requireApprovedPainter, async (req, res, next) => {
  try {
    res.json(req.painter);
  } catch (err) {
    next(err);
  }
});

router.get('/offers', async (req, res, next) => {
  try {
    const offers = await Offer.find({ active: true }).sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    next(err);
  }
});

router.get('/transactions', requireAuth, requireApprovedPainter, async (req, res, next) => {
  try {
    const tx = await Transaction.find({ painter: req.user.painterId }).sort({ createdAt: -1 }).limit(100);
    res.json(tx);
  } catch (err) {
    next(err);
  }
});

module.exports = router;


