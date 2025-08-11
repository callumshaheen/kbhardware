const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String },
    role: { type: String, default: 'admin' },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

AdminSchema.methods.comparePassword = async function comparePassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.model('Admin', AdminSchema);


