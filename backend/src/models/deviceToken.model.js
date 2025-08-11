const mongoose = require('mongoose');

const DeviceTokenSchema = new mongoose.Schema(
  {
    painter: { type: mongoose.Schema.Types.ObjectId, ref: 'Painter', required: true, index: true },
    token: { type: String, required: true, unique: true },
    platform: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model('DeviceToken', DeviceTokenSchema);


