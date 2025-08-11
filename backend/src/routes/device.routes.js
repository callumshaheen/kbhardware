const express = require('express');
const Joi = require('joi');
const { requireAuth, requireApprovedPainter } = require('../middleware/auth');
const DeviceToken = require('../models/deviceToken.model');

const router = express.Router();

router.post('/register', requireAuth, requireApprovedPainter, async (req, res, next) => {
  try {
    const schema = Joi.object({ token: Joi.string().required(), platform: Joi.string().allow('') });
    const { value, error } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const { token, platform } = value;
    const doc = await DeviceToken.findOneAndUpdate(
      { token },
      { token, platform, painter: req.user.painterId },
      { upsert: true, new: true }
    );
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
});

module.exports = router;


