const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    description: { type: String },
    commissionPercent: { type: Number, required: true },
    extraFlat: { type: Number, default: 0 },
    active: { type: Boolean, default: true, index: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model('Offer', OfferSchema);


