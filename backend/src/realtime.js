/*
Realtime module for socket.io + mongoose change streams
*/

const jwt = require('jsonwebtoken');
const Painter = require('./models/painter.model');
const Transaction = require('./models/transaction.model');

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function emitLeaderboardTopN(io) {
  Painter.find({})
    .sort({ totalCommission: -1 })
    .limit(20)
    .select('name totalCommission')
    .then(topPainters => {
      io.to('leaderboard').emit('leaderboard_update', topPainters);
    });
}

module.exports = function(io, mongooseConnection) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Auth token required'));
      const payload = jwt.verify(token, JWT_SECRET);
      socket.user = payload;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const { user } = socket;
    if (!user) return;
    // Join painter room if painter
    if (user.role === 'painter' && user.painterId) {
      socket.join(`painter:${user.painterId}`);
    }
    // Join leaderboard room if requested
    socket.on('join_leaderboard', () => {
      socket.join('leaderboard');
      emitLeaderboardTopN(io);
    });
  });

  // Watch transactions: on insert, emit to painter room and leaderboard
  const transactionStream = mongooseConnection.collection('transactions').watch([
    { $match: { operationType: 'insert' } }
  ]);
  transactionStream.on('change', async (change) => {
    const txId = change.fullDocument._id;
    const tx = await Transaction.findById(txId).populate('painter');
    if (tx && tx.painter) {
      io.to(`painter:${tx.painter._id}`).emit('balance_update', {
        painterId: tx.painter._id,
        totalCommission: tx.painter.totalCommission
      });
      emitLeaderboardTopN(io);
    }
  });

  // Watch painters: on update to totalCommission, emit balance_update
  const painterStream = mongooseConnection.collection('painters').watch([
    { $match: { operationType: 'update', 'updateDescription.updatedFields.totalCommission': { $exists: true } } }
  ]);
  painterStream.on('change', async (change) => {
    const painterId = change.documentKey._id;
    const painter = await Painter.findById(painterId);
    if (painter) {
      io.to(`painter:${painterId}`).emit('balance_update', {
        painterId,
        totalCommission: painter.totalCommission
      });
      emitLeaderboardTopN(io);
    }
  });

  // Expose leaderboard utility
  io.emitLeaderboardTopN = () => emitLeaderboardTopN(io);
};
const jwt = require('jsonwebtoken');
const Painter = require('./models/painter.model');
const Transaction = require('./models/transaction.model');

function attachRealtime(io, mongooseConnection) {
  // Socket auth middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error('Missing token'));
      const user = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = user;
      if (user.role === 'painter') {
        socket.join(`painter:${user.painterId}`);
      }
      return next();
    } catch (err) {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('join_leaderboard', () => {
      socket.join('leaderboard');
    });
  });

  async function emitLeaderboardTopN(n = 20) {
    const top = await Painter.find({ status: 'approved' })
      .sort({ totalCommission: -1 })
      .limit(n)
      .select('name phone totalCommission approvedAt');
    io.to('leaderboard').emit('leaderboard_update', top);
  }

  // Change streams
  try {
    const txStream = mongooseConnection.collection('transactions').watch([
      { $match: { operationType: 'insert' } },
    ]);
    txStream.on('change', async (change) => {
      const doc = change.fullDocument;
      if (!doc) return;
      const painterId = doc.painter && doc.painter.toString();
      // Emit to painter room
      try {
        const painter = await Painter.findById(painterId);
        if (painter) {
          io.to(`painter:${painterId}`).emit('balance_update', { totalCommission: painter.totalCommission });
          await emitLeaderboardTopN();
        }
      } catch {}
    });
  } catch (err) {
    console.log('Change streams unavailable:', err.message);
  }

  try {
    const painterStream = mongooseConnection.collection('painters').watch([
      { $match: { operationType: 'update' } },
    ]);
    painterStream.on('change', async (change) => {
      const painterId = change.documentKey && change.documentKey._id && change.documentKey._id.toString();
      if (painterId) {
        try {
          const painter = await Painter.findById(painterId);
          if (painter) {
            io.to(`painter:${painterId}`).emit('balance_update', { totalCommission: painter.totalCommission });
          }
        } catch {}
      }
    });
  } catch (err) {
    console.log('Painter change stream unavailable:', err.message);
  }

  return { emitLeaderboardTopN };
}

module.exports = attachRealtime;


