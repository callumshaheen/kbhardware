const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { versionKey: false }
);

// TTL index: remove when expiresAt < now
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Otp', OtpSchema);


