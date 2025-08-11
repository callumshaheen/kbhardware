const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { requireAuth, requireRole } = require('../middleware/auth');
const Painter = require('../models/painter.model');
const Admin = require('../models/admin.model');
const Offer = require('../models/offer.model');
const Transaction = require('../models/transaction.model');
const { addCommission } = require('../services/commission.service');
const DeviceToken = require('../models/deviceToken.model');

const router = express.Router();

// Admin login
router.post('/login', async (req, res, next) => {
  try {
    const schema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() });
    const { value, error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const { email, password } = value;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ role: 'admin', adminId: admin._id.toString(), email: admin.email }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    return res.json({ token });
  } catch (err) {
    next(err);
  }
});

// List painters by status
router.get('/painters', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const painters = await Painter.find(filter).sort({ createdAt: -1 });
    res.json(painters);
  } catch (err) {
    next(err);
  }
});

// Approve painter
router.patch('/painters/:id/approve', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const painter = await Painter.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedAt: new Date() },
      { new: true }
    );
    if (!painter) return res.status(404).json({ error: 'Not found' });
    // Push notification (best-effort)
    try {
      const tokens = await DeviceToken.find({ painter: painter._id });
      if (tokens.length) {
        const messages = tokens.map((t) => ({ to: t.token, sound: 'default', title: 'Approved', body: 'Your account has been approved.' }));
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messages),
        });
      }
    } catch (e) {
      console.log('Push send failed:', e.message);
    }
    res.json(painter);
  } catch (err) {
    next(err);
  }
});

router.patch('/painters/:id/reject', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const painter = await Painter.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!painter) return res.status(404).json({ error: 'Not found' });
    res.json(painter);
  } catch (err) {
    next(err);
  }
});

router.patch('/painters/:id/remove', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const painter = await Painter.findByIdAndUpdate(
      req.params.id,
      { status: 'removed' },
      { new: true }
    );
    if (!painter) return res.status(404).json({ error: 'Not found' });
    res.json(painter);
  } catch (err) {
    next(err);
  }
});

// Offers
router.post('/offers', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const schema = Joi.object({
      productName: Joi.string().required(),
      description: Joi.string().allow(''),
      commissionPercent: Joi.number().min(0).required(),
      extraFlat: Joi.number().min(0).default(0),
    });
    const { value, error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const offer = await Offer.create(value);
    res.status(201).json(offer);
  } catch (err) {
    next(err);
  }
});

router.delete('/offers/:id', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!offer) return res.status(404).json({ error: 'Not found' });
    res.json(offer);
  } catch (err) {
    next(err);
  }
});

// Commissions
router.post('/commissions', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const schema = Joi.object({
      painterId: Joi.string().required(),
      amount: Joi.number().positive().required(),
      offerId: Joi.string().optional(),
    });
    const { value, error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const transaction = await addCommission({ ...value, adminId: req.user.adminId });
    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
});

module.exports = router;


