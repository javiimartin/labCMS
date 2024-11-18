const express = require('express');
const { registerAdmin, loginAdmin, getAllAdmins, updateAdmin } = require('../controllers/admin.controller');
const { adminAuthMiddleware } = require('../util/authMiddleware'); // Middleware de autenticación básica para administradores

const router = express.Router();

// Ruta pública para que los administradores hagan login
router.post('/login', loginAdmin);

// Rutas protegidas para administración de usuarios 
router.post('/register', adminAuthMiddleware, registerAdmin);
router.get('/admins', adminAuthMiddleware, getAllAdmins);
router.put('/admins/:id', adminAuthMiddleware, updateAdmin);

module.exports = router;
