const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { createApp } = require('../src/app');
const Otp = require('../src/models/otp.model');

let mongod;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  app = createApp();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

test('POST /auth/request-otp returns 200', async () => {
  const res = await request(app).post('/auth/request-otp').send({ phone: '+911234567890' });
  expect(res.statusCode).toBe(200);
  const doc = await Otp.findOne({ phone: '+911234567890' });
  expect(doc).toBeTruthy();
});


