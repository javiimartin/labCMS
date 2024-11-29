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
    const existingAdmin = await pool.query('SELECT * FROM dep_admin WHERE admin_email = $1', [req.body.admin_email]);
    if (existingAdmin.rows.length > 0) {
      return res.status(400).json({ msg: 'El administrador ya existe' });
    }

    // Lógica para registrar el administrador
  } catch (error) {
    console.error('Error en registerAdmin:', error.message);
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
