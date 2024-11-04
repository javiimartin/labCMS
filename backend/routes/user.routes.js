const express = require('express');
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/user.controller');
const { unifiedAuthMiddleware } = require('../util/authMiddleware');
const router = express.Router();

// Rutas públicas para registro y login
router.post('/register', registerUser);
router.post('/login', loginUser);

// Rutas protegidas por autenticación
router.get('/profile', studentAuthMiddleware, getUserProfile);
router.put('/profile', studentAuthMiddleware, updateUserProfile);

module.exports = router;
