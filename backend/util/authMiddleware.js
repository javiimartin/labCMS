const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  if (!req || !req.headers) {
    return res.status(500).json({ message: 'Request object is missing or malformed' });
  }

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

    console.log("Authenticated user:", user);
    req.user = user; 

    next();
  });
};

module.exports = { authMiddleware };