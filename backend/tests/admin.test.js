const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const { createApp } = require('../src/app');
const Painter = require('../src/models/painter.model');
const Admin = require('../src/models/admin.model');
const Transaction = require('../src/models/transaction.model');
const bcrypt = require('bcryptjs');

let mongod;
let app;
let adminToken;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  app = createApp();

  const passwordHash = await bcrypt.hash('password', 10);
  const admin = await Admin.create({ email: 'admin@example.com', passwordHash });
  adminToken = jwt.sign({ role: 'admin', adminId: admin._id.toString(), email: admin.email }, 'testsecret');
  process.env.JWT_SECRET = 'testsecret';
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

test('Admin approves painter and adds commission', async () => {
  const painter = await Painter.create({ phone: '+911111111111', status: 'pending' });

  const approveRes = await request(app)
    .patch(`/admin/painters/${painter._id}/approve`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send();
  expect(approveRes.statusCode).toBe(200);
  expect(approveRes.body.status).toBe('approved');

  const txRes = await request(app)
    .post('/admin/commissions')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ painterId: painter._id.toString(), amount: 1000 });
  expect(txRes.statusCode).toBe(201);
  const tx = await Transaction.findOne({ painter: painter._id });
  expect(tx).toBeTruthy();
});


