const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../../config/.env' });

const generateToken = (user) => {
    return jwt.sign(
      { 
        user_id: user.user_id || user.admin_id,
        email: user.user_email || user.admin_email,
        isAdmin: user.isAdmin || false 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );
  };
  
  module.exports = generateToken;