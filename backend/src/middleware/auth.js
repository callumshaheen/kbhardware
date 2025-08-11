const jwt = require('jsonwebtoken');
const Painter = require('../models/painter.model');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

async function requireApprovedPainter(req, res, next) {
  try {
    if (!req.user || req.user.role !== 'painter') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const painter = await Painter.findById(req.user.painterId);
    if (!painter) return res.status(404).json({ error: 'Painter not found' });
    if (painter.status !== 'approved') {
      return res.status(403).json({ error: 'Painter not approved', status: painter.status });
    }
    req.painter = painter;
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { requireAuth, requireRole, requireApprovedPainter };


