const { validationResult } = require('express-validator');
const {
  findAdminByEmail,
  createAdmin,
  getAllAdmins,
  updateAdminById,
  comparePasswords,
  generateToken
} = require('../services/admin.service');
const logger = require('../logger');

const registerAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`Validation error in registerAdmin: ${JSON.stringify(errors.array())}`);
    return res.status(400).json({ msg: 'Invalid input', errors: errors.array() });
  }

  const { admin_name, admin_surname, admin_email, admin_password } = req.body;

  if (!/^\S+@\S+\.\S+$/.test(admin_email)) {
    logger.warn(`Invalid email format in registerAdmin: ${admin_email}`);
    return res.status(400).json({ msg: 'Invalid input' });
  }

  try {
    const existingAdmin = await findAdminByEmail(admin_email);
    if (existingAdmin) {
      logger.warn(`Attempt to register existing admin: ${admin_email}`);
      return res.status(400).json({ msg: 'El administrador ya existe' });
    }

    const newAdmin = await createAdmin(admin_name, admin_surname, admin_email, admin_password);
    const token = generateToken({ ...newAdmin, isAdmin: true });

    logger.info(`Admin registered successfully: ${admin_email}`);
    return res.status(201).json({ token });
  } catch (error) {
    logger.error(`Error in registerAdmin: ${error.message}`);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

const loginAdmin = async (req, res) => {
  const { admin_email, admin_password } = req.body;

  try {
    const admin = await findAdminByEmail(admin_email);
    if (!admin) {
      logger.warn(`Login failed: Admin not found (${admin_email})`);
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const isMatch = await comparePasswords(admin_password, admin.admin_password);
    if (!isMatch) {
      logger.warn(`Login failed: Invalid password for admin (${admin_email})`);
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const token = generateToken({ ...admin, isAdmin: true });
    logger.info(`Admin logged in successfully: ${admin_email}`);
    return res.status(200).json({ token });
  } catch (error) {
    logger.error(`Error in loginAdmin: ${error.message}`);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

const getAllAdminsHandler = async (req, res) => {
  try {
    const admins = await getAllAdmins();
    logger.info(`Retrieved all admins. Total count: ${admins.length}`);
    return res.status(200).json(admins);
  } catch (error) {
    logger.error(`Error in getAllAdminsHandler: ${error.message}`);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

const updateAdminHandler = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`Validation error in updateAdminHandler: ${JSON.stringify(errors.array())}`);
    return res.status(400).json({ msg: 'Invalid input', errors: errors.array() });
  }

  const { admin_name, admin_surname, admin_email, admin_password } = req.body;

  if (admin_email && !/^\S+@\S+\.\S+$/.test(admin_email)) {
    logger.warn(`Invalid email format in updateAdminHandler: ${admin_email}`);
    return res.status(400).json({ msg: 'Invalid input' });
  }

  try {
    const updatedAdmin = await updateAdminById(req.params.id, admin_name, admin_surname, admin_email, admin_password);

    if (!updatedAdmin) {
      logger.warn(`Update failed: Admin not found with ID ${req.params.id}`);
      return res.status(404).json({ msg: 'Administrador no encontrado' });
    }

    const { admin_password: _, ...adminData } = updatedAdmin;
    logger.info(`Admin updated successfully with ID: ${req.params.id}`);
    return res.status(200).json(adminData);
  } catch (error) {
    logger.error(`Error in updateAdminHandler for admin ID ${req.params.id}: ${error.message}`);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAllAdminsHandler,
  updateAdminHandler
};
