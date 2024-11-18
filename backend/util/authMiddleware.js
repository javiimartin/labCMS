const jwt = require('jsonwebtoken');

const authMiddleware = (role) => (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token error:", err);
      return res.status(403).json({ message: 'Invalid token' });
    }
    console.log("User role:", user.role); // Añade esta línea para ver el rol
    req.user = user;

    if (role === 'student' && user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Requires student privileges' });
    }
    if (role === 'admin' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Requires admin privileges' });
    }

    next();
  });
};

module.exports = { authMiddleware };