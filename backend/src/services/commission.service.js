const Painter = require('../models/painter.model');
const Offer = require('../models/offer.model');
const Transaction = require('../models/transaction.model');
const mongoose = require('mongoose');

async function addCommission({ painterId, amount, offerId, adminId }) {
  let commission = 0;
  if (offerId) {
    const offer = await Offer.findById(offerId);
    if (!offer) throw new Error('Offer not found');
    commission = (amount * (offer.commissionPercent || 0)) / 100 + (offer.extraFlat || 0);
  } else {
    commission = amount * 0.05; // default 5% if no offer
  }

  const session = await mongoose.startSession();
  let transactionDoc;
  try {
    await session.withTransaction(async () => {
      transactionDoc = await Transaction.create([
        { painter: painterId, offer: offerId || undefined, amount, commission, createdBy: adminId },
      ], { session });
      transactionDoc = transactionDoc[0];
      await Painter.findByIdAndUpdate(
        painterId,
        { $inc: { totalCommission: commission } },
        { new: true, session }
      );
    });
  } finally {
    await session.endSession();
  }

  // Emit events after transaction
  try {
    const io = require('..').io || null; // not used; will emit via app.locals in routes/realtime
  } catch {}

  return transactionDoc;
}

module.exports = { addCommission };


