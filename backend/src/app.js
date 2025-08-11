require('dotenv').config();
const express = require('express');
const cors = require('cors');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:19006';

const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const painterRoutes = require('./routes/painter.routes');
const deviceRoutes = require('./routes/device.routes');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cors({ origin: FRONTEND_URL, credentials: true }));

  app.get('/health', (req, res) => res.json({ ok: true }));
  app.use('/auth', authRoutes);
  app.use('/admin', adminRoutes);
  app.use('/painters', painterRoutes);
  app.use('/device', deviceRoutes);

  // Basic error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  return app;
}

module.exports = { createApp };


