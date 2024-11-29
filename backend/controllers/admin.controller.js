const { validationResult } = require('express-validator');
const {
  findAdminByEmail,
  createAdmin,
  getAllAdmins,
  updateAdminById,
  comparePasswords,
  generateToken
} = require('../services/admin.service');

const registerAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: 'Invalid input', errors: errors.array() });
  }

  const { admin_name, admin_surname, admin_email, admin_password } = req.body;

  if (!/^\S+@\S+\.\S+$/.test(admin_email)) {
    return res.status(400).json({ msg: 'Invalid input' });
  }

  try {
    const existingAdmin = await findAdminByEmail(admin_email);
    if (existingAdmin) {
      return res.status(400).json({ msg: 'El administrador ya existe' });
    }

    const newAdmin = await createAdmin(admin_name, admin_surname, admin_email, admin_password);
    const token = generateToken({ ...newAdmin, isAdmin: true });

    return res.status(201).json({ token });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

const loginAdmin = async (req, res) => {
  const { admin_email, admin_password } = req.body;

  try {
    const admin = await findAdminByEmail(admin_email);
    if (!admin) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const isMatch = await comparePasswords(admin_password, admin.admin_password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const token = generateToken({ ...admin, isAdmin: true });
    return res.status(200).json({ token });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

const getAllAdminsHandler = async (req, res) => {
  try {
    const admins = await getAllAdmins();
    return res.status(200).json(admins);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

const updateAdminHandler = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: 'Invalid input', errors: errors.array() });
  }

  const { admin_name, admin_surname, admin_email, admin_password } = req.body;

  if (admin_email && !/^\S+@\S+\.\S+$/.test(admin_email)) {
    return res.status(400).json({ msg: 'Invalid input' });
  }

  try {
    const updatedAdmin = await updateAdminById(req.params.id, admin_name, admin_surname, admin_email, admin_password);

    if (!updatedAdmin) {
      return res.status(404).json({ msg: 'Administrador no encontrado' });
    }

    const { admin_password: _, ...adminData } = updatedAdmin;
    return res.status(200).json(adminData);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAllAdminsHandler,
  updateAdminHandler
};
