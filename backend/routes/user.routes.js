const express = require('express');
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/user.controller');
const { authMiddleware } = require('../util/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: Gestión de usuarios
 */

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Registro de un nuevo usuario
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_name:
 *                 type: string
 *                 description: Nombre del usuario.
 *               user_surname:
 *                 type: string
 *                 description: Apellido del usuario.
 *               user_email:
 *                 type: string
 *                 description: Correo electrónico del usuario.
 *               user_password:
 *                 type: string
 *                 description: Contraseña del usuario.
 *               user_gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 description: Género del usuario.
 *               user_age:
 *                 type: integer
 *                 description: Edad del usuario.
 *               user_degree:
 *                 type: string
 *                 description: Grado académico del usuario.
 *               user_zipcode:
 *                 type: string
 *                 description: Código postal del usuario.
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticación.
 *       400:
 *         description: Error en los datos de entrada.
 *       500:
 *         description: Error en el servidor.
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Inicio de sesión de usuario
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_email:
 *                 type: string
 *                 description: Correo electrónico del usuario.
 *               user_password:
 *                 type: string
 *                 description: Contraseña del usuario.
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticación.
 *       400:
 *         description: Credenciales inválidas.
 *       500:
 *         description: Error en el servidor.
 */
router.post('/login', loginUser);

module.exports = router;