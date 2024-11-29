const bcrypt = require('bcrypt');
const pool = require('../db');
const generateToken = require('../util/generateToken');

// Registro de administrador
const registerAdminService = async ({ admin_name, admin_surname, admin_email, admin_password }) => {
  const { rows } = await pool.query('SELECT * FROM dep_admin WHERE admin_email = $1', [admin_email]);
  if (rows.length > 0) {
    throw new Error('El administrador ya existe');
  }

  const hashedPassword = await bcrypt.hash(admin_password, 10);
  const result = await pool.query(
    'INSERT INTO dep_admin (admin_name, admin_surname, admin_email, admin_password) VALUES ($1, $2, $3, $4) RETURNING *',
    [admin_name, admin_surname, admin_email, hashedPassword]
  );

  const token = generateToken({ ...result.rows[0], isAdmin: true });
  return token;
};

// Login de administrador
const loginAdminService = async ({ admin_email, admin_password }) => {
  const { rows } = await pool.query('SELECT * FROM dep_admin WHERE admin_email = $1', [admin_email]);
  if (rows.length === 0) {
    throw new Error('Credenciales inválidas');
  }

  const isMatch = await bcrypt.compare(admin_password, rows[0].admin_password);
  if (!isMatch) {
    throw new Error('Credenciales inválidas');
  }

  const token = generateToken({ ...rows[0], isAdmin: true });
  return token;
};

// Obtener todos los administradores
const getAllAdminsService = async () => {
  const result = await pool.query('SELECT * FROM dep_admin');
  return result.rows.map(admin => {
    const { admin_password, ...adminInfo } = admin;
    return adminInfo;
  });
};

// Actualizar información de un administrador
const updateAdminService = async (id, { admin_name, admin_surname, admin_email, admin_password }) => {
  const hashedPassword = admin_password ? await bcrypt.hash(admin_password, 10) : undefined;

  const result = await pool.query(
    `UPDATE dep_admin SET
      admin_name = $1,
      admin_surname = $2,
      admin_email = $3,
      admin_password = COALESCE($4, admin_password)
      WHERE admin_id = $5 RETURNING *`,
    [admin_name, admin_surname, admin_email, hashedPassword, id]
  );

  if (result.rows.length === 0) {
    throw new Error('Administrador no encontrado');
  }

  const { admin_password: _, ...adminData } = result.rows[0];
  return adminData;
};

module.exports = {
  registerAdminService,
  loginAdminService,
  getAllAdminsService,
  updateAdminService,
};