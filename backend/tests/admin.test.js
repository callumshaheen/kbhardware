// Integration test for admin approves painter workflow and commissions
jest.setTimeout(30000);
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const request = require('supertest');
const { createApp } = require('../src/app');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Painter = require('../src/models/painter.model');
const Admin = require('../src/models/admin.model');
const Transaction = require('../src/models/transaction.model');
const Otp = require('../src/models/otp.model');
const app = createApp();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('Admin approves painter workflow', () => {
  let adminToken, painterId, painterPhone;

  it('should create admin and login', async () => {
    const password = 'pass';
    const passwordHash = await bcrypt.hash(password, 10);
    await Admin.create({ email: 'admin@example.com', passwordHash });
    const res = await request(app)
      .post('/admin/login')
      .send({ email: 'admin@example.com', password });
    expect(res.statusCode).toBe(200);
    adminToken = res.body.token;
  });

  it('should create pending painter via OTP verification', async () => {
    painterPhone = '1234567890';
    // Request OTP
    await request(app)
      .post('/auth/request-otp')
      .send({ phone: painterPhone });
    // Get OTP from db
    const otpDoc = await Otp.findOne({ phone: painterPhone }).sort({ expiresAt: -1 });
    expect(otpDoc).toBeTruthy();
    // Verify OTP
    const verifyRes = await request(app)
      .post('/auth/verify-otp')
      .send({ phone: painterPhone, otp: otpDoc.otp });
    expect([200,202]).toContain(verifyRes.statusCode);
    // Get painter
    const painterDoc = await Painter.findOne({ phone: painterPhone });
    expect(painterDoc).toBeTruthy();
    expect(painterDoc.status).toBe('pending');
    painterId = painterDoc._id;
  });

  it('admin PATCH approve painter', async () => {
    const res = await request(app)
      .patch(`/admin/painters/${painterId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    const painter = await Painter.findById(painterId);
    expect(painter.status).toBe('approved');
  });
});

describe('POST /admin/commissions', () => {
  it('should create a transaction and increment Painter.totalCommission', async () => {
    const password = 'pass2';
    const passwordHash = await bcrypt.hash(password, 10);
    await Admin.create({ email: 'admin2@example.com', passwordHash });
    const loginRes = await request(app)
      .post('/admin/login')
      .send({ email: 'admin2@example.com', password });
    const token = loginRes.body.token;
    // Create painter
    const painter = await Painter.create({ name: 'Painter2', phone: '0987654321', totalCommission: 0 });
    const res = await request(app)
      .post('/admin/commissions')
      .set('Authorization', `Bearer ${token}`)
      .send({ painterId: painter._id.toString(), amount: 100 });
    expect(res.statusCode).toBe(201);
    const transaction = await Transaction.findOne({ painter: painter._id });
    expect(transaction).toBeTruthy();
    const updatedPainter = await Painter.findById(painter._id);
    expect(updatedPainter.totalCommission).toBeGreaterThanOrEqual(5); // 5% default commission
  });
});


