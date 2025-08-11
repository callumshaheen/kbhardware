const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    painter: { type: mongoose.Schema.Types.ObjectId, ref: 'Painter', required: true, index: true },
    offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
    amount: { type: Number, required: true },
    commission: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model('Transaction', TransactionSchema);


