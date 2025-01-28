const express = require('express');
const { registerAdmin, loginAdmin, getAllAdmins, updateAdmin } = require('../controllers/admin.controller');
const { authMiddleware } = require('../util/authMiddleware'); // Middleware de autenticación básica para administradores

const router = express.Router();

console.log("🚀 Admin router cargado correctamente");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Gestión de administradores
 */

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Inicio de sesión de administrador
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_email:
 *                 type: string
 *                 description: Correo electrónico del administrador.
 *               user_password:
 *                 type: string
 *                 description: Contraseña del administrador.
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
router.post('/login', loginAdmin);

/**
 * @swagger
 * /admin/register:
 *   post:
 *     summary: Registro de un nuevo administrador
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_name:
 *                 type: string
 *                 description: Nombre del administrador.
 *               user_surname:
 *                 type: string
 *                 description: Apellido del administrador.
 *               user_email:
 *                 type: string
 *                 description: Correo electrónico del administrador.
 *               user_password:
 *                 type: string
 *                 description: Contraseña del administrador.
 *     responses:
 *       201:
 *         description: Administrador registrado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticación.
 *       400:
 *         description: Datos de entrada inválidos.
 *       500:
 *         description: Error en el servidor.
 */
router.post('/register', registerAdmin);

/**
 * @swagger
 * /admin/admins:
 *   get:
 *     summary: Obtener la lista de administradores
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de administradores obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user_code:
 *                     type: string
 *                     description: ID del administrador.
 *                   user_name:
 *                     type: string
 *                     description: Nombre del administrador.
 *                   user_surname:
 *                     type: string
 *                     description: Apellido del administrador.
 *                   user_email:
 *                     type: string
 *                     description: Correo electrónico del administrador.
 *       401:
 *         description: No autorizado.
 *       500:
 *         description: Error en el servidor.
 */
router.get('/admins', authMiddleware, getAllAdmins);

/**
 * @swagger
 * /admin/admins/{id}:
 *   put:
 *     summary: Actualizar información de un administrador
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del administrador a actualizar.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_name:
 *                 type: string
 *                 description: Nombre actualizado del administrador.
 *               user_surname:
 *                 type: string
 *                 description: Apellido actualizado del administrador.
 *               user_email:
 *                 type: string
 *                 description: Correo electrónico actualizado del administrador.
 *               user_password:
 *                 type: string
 *                 description: Contraseña actualizada del administrador.
 *     responses:
 *       200:
 *         description: Administrador actualizado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_code:
 *                   type: string
 *                   description: ID del administrador.
 *                 user_name:
 *                   type: string
 *                   description: Nombre del administrador.
 *                 user_surname:
 *                   type: string
 *                   description: Apellido del administrador.
 *                 user_email:
 *                   type: string
 *                   description: Correo electrónico del administrador.
 *       400:
 *         description: Datos de entrada inválidos.
 *       404:
 *         description: Administrador no encontrado.
 *       500:
 *         description: Error en el servidor.
 */
router.put('/admins/:id', authMiddleware, updateAdmin);

module.exports = router;
