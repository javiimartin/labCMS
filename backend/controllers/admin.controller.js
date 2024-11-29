const {
  registerAdminService,
  loginAdminService,
  getAllAdminsService,
  updateAdminService,
} = require('../services/admin.service');
const { validationResult } = require('express-validator');

const registerAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: 'Invalid input', errors: errors.array() });
  }

  try {
    const token = await registerAdminService(req.body);
    return res.status(201).json({ token });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const token = await loginAdminService(req.body);
    return res.status(200).json({ token });
  } catch (error) {
    if (error.message === 'Credenciales inválidas') {
      return res.status(400).json({ msg: error.message });
    }
    console.error(error.message);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

const getAllAdmins = async (req, res) => {
  try {
    const admins = await getAllAdminsService();
    return res.status(200).json(admins);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

const updateAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: 'Invalid input', errors: errors.array() });
  }

  try {
    const updatedAdmin = await updateAdminService(req.params.id, req.body);
    return res.status(200).json(updatedAdmin);
  } catch (error) {
    if (error.message === 'Administrador no encontrado') {
      return res.status(404).json({ msg: error.message });
    }
    console.error(error.message);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAllAdmins,
  updateAdmin,
};
