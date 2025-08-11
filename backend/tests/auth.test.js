require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
jest.setTimeout(30000);
const request = require('supertest');
const { createApp } = require('../src/app');
const mongoose = require('mongoose');
const Otp = require('../src/models/otp.model');
const app = createApp();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /auth/request-otp', () => {
  it('should return 200 for valid request', async () => {
    const res = await request(app)
      .post('/auth/request-otp')
      .send({ phone: '1234567890' });
    expect(res.statusCode).toBe(200);
    const doc = await Otp.findOne({ phone: '1234567890' });
    expect(doc).toBeTruthy();
  });
});


