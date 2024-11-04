const jwt = require('jsonwebtoken');

// Middleware para verificar que el usuario es un estudiante
const studentAuthMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({ message: 'Access denied. Requires student privileges' });
  }
  next();
};

// Middleware para verificar que el usuario es un administrador
const adminAuthMiddleware = (req, res, next) => {
  if (!req.admin) {
    return res.status(403).json({ message: 'Access denied. Requires admin privileges' });
  }
  next();
};

module.exports = { unifiedAuthMiddleware, studentAuthMiddleware, adminAuthMiddleware };
