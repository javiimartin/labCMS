const { validationResult } = require('express-validator');
const logger = require('../util/logger');
const {
  registerAdminService,
  loginAdminService,
  getAllAdminsService,
  updateAdminService,
} = require('../services/admin.service');

// Registro de administrador
const registerAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Intento de registro de administrador con datos inválidos', { errors: errors.array() });
    return res.status(400).json({ msg: 'Invalid input', errors: errors.array() });
  }

  try {
    const token = await registerAdminService(req.body);
    logger.info(`Administrador registrado con éxito: ${req.body.admin_email}`);
    return res.status(201).json({ token });
  } catch (error) {
    logger.error(`Error al registrar administrador: ${error.message}`);
    return res.status(400).json({ msg: error.message });
  }
};

// Login de administrador
const loginAdmin = async (req, res) => {
  try {
    const token = await loginAdminService(req.body);
    logger.info(`Administrador inició sesión: ${req.body.admin_email}`);
    return res.status(200).json({ token });
  } catch (error) {
    logger.warn(`Intento fallido de login para administrador: ${req.body.admin_email}`);
    return res.status(400).json({ msg: error.message });
  }
};

// Obtener todos los administradores
const getAllAdmins = async (req, res) => {
  try {
    const admins = await getAllAdminsService();
    logger.info('Consulta realizada para obtener todos los administradores');
    return res.status(200).json(admins);
  } catch (error) {
    logger.error(`Error al obtener los administradores: ${error.message}`);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Actualizar información de un administrador
const updateAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Intento de actualización de administrador con datos inválidos', { errors: errors.array() });
    return res.status(400).json({ msg: 'Invalid input', errors: errors.array() });
  }

  try {
    const updatedAdmin = await updateAdminService(req.params.id, req.body);
    logger.info(`Administrador actualizado con ID: ${req.params.id}`);
    return res.status(200).json(updatedAdmin);
  } catch (error) {
    logger.error(`Error al actualizar el administrador con ID ${req.params.id}: ${error.message}`);
    return res.status(400).json({ msg: error.message });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAllAdmins,
  updateAdmin,
};
