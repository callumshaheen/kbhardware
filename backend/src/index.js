/*
Copilot: Create an Express server file that:
- Loads dotenv
- Connects to MongoDB using mongoose with MONGO_URI from env
- Creates Express app with JSON parsing, CORS (allow FRONTEND_URL)
- Set up http server and attach socket.io
- Export io object from this file or attach to app.locals.io
- Start server on PORT with console logs
- Gracefully handle mongoose connection errors
*/

require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const attachRealtime = require('./realtime');
const { createApp } = require('./app');

const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:19006';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/paintshop';

async function start() {
  const app = createApp();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: FRONTEND_URL, methods: ['GET', 'POST', 'PATCH', 'DELETE'], credentials: true }
  });

  app.locals.io = io;

  // Routes are in app.js

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  // Start HTTP server immediately so /health works even if Mongo is down
  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });

  // Connect to MongoDB without blocking server start
  mongoose
    .connect(MONGO_URI, { autoIndex: true, serverSelectionTimeoutMS: 2000 })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('Failed to connect to MongoDB:', err.message));

  // Initialize realtime watchers after connection is ready
  mongoose.connection.once('open', () => {
    try {
      attachRealtime(io, mongoose.connection);
      console.log('Realtime initialized');
    } catch (e) {
      console.log('Realtime init failed:', e.message);
    }
  });

  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    try {
      await mongoose.disconnect();
    } catch {}
    server.close(() => process.exit(0));
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
