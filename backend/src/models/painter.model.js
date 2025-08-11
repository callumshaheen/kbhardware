const mongoose = require('mongoose');

const PainterSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'removed'],
      default: 'pending',
      index: true,
    },
    totalCommission: { type: Number, default: 0, index: true },
    createdAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
  },
  { versionKey: false }
);

PainterSchema.statics.incrementCommission = async function incrementCommission(
  painterId,
  amount
) {
  const updated = await this.findByIdAndUpdate(
    painterId,
    { $inc: { totalCommission: amount } },
    { new: true }
  );
  return updated;
};

module.exports = mongoose.model('Painter', PainterSchema);


