const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const Painter = require('../models/painter.model');
const Otp = require('../models/otp.model');

const router = express.Router();

const phoneSchema = Joi.object({ phone: Joi.string().trim().required() });
const verifySchema = Joi.object({ phone: Joi.string().trim().required(), otp: Joi.string().length(6).required() });

router.post('/request-otp', async (req, res, next) => {
  try {
    const { value, error } = phoneSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const { phone } = value;

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await Otp.create({ phone, otp, expiresAt });

    if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
      // Minimal Twilio send fallback (optional - not failing the request)
      try {
        const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        if (process.env.TWILIO_SERVICE_SID) {
          await twilio.verify.v2.services(process.env.TWILIO_SERVICE_SID).verifications.create({ to: phone, channel: 'sms' });
        } else {
          await twilio.messages.create({ to: phone, from: process.env.TWILIO_FROM || undefined, body: `Your OTP is ${otp}` });
        }
      } catch (e) {
        console.log('Twilio send failed, falling back to console:', e.message);
        console.log('OTP for', phone, 'is', otp);
      }
    } else {
      console.log('OTP for', phone, 'is', otp);
    }

    return res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post('/verify-otp', async (req, res, next) => {
  try {
    const { value, error } = verifySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });
    const { phone, otp } = value;

    const otpDoc = await Otp.findOne({ phone }).sort({ expiresAt: -1 });
    if (!otpDoc) return res.status(400).json({ error: 'OTP not found' });
    if (otpDoc.expiresAt.getTime() < Date.now()) return res.status(400).json({ error: 'OTP expired' });
    if (otpDoc.otp !== otp) return res.status(400).json({ error: 'OTP mismatch' });

    let painter = await Painter.findOne({ phone });
    if (!painter) {
      painter = await Painter.create({ phone, status: 'pending' });
      await Otp.deleteMany({ phone });
      return res.status(202).json({ status: 'pending' });
    }

    await Otp.deleteMany({ phone });

    if (painter.status !== 'approved') {
      return res.status(202).json({ status: painter.status });
    }

    const token = jwt.sign(
      { role: 'painter', painterId: painter._id.toString(), phone: painter.phone },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.json({ token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;


