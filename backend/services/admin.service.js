const bcrypt = require('bcrypt');
const pool = require('../db');
const generateToken = require('../util/generateToken');

// Registro de administrador
const registerAdminService = async ({ user_name, user_surname, user_email, user_password }) => {
  const { rows } = await pool.query('SELECT * FROM dep_admin WHERE user_email = $1', [user_email]);
  if (rows.length > 0) {
    throw new Error('El administrador ya existe');
  }

  const hashedPassword = await bcrypt.hash(user_password, 10);
  const result = await pool.query(
    'INSERT INTO dep_admin (user_name, user_surname, user_email, user_password) VALUES ($1, $2, $3, $4) RETURNING *',
    [user_name, user_surname, user_email, hashedPassword]
  );

  const token = generateToken({ ...result.rows[0], isAdmin: true });
  return token;
};

// Login de administrador
const loginAdminService = async ({ user_email, user_password }) => {
  const { rows } = await pool.query('SELECT * FROM dep_admin WHERE user_email = $1', [user_email]);
  if (rows.length === 0) {
    throw new Error('Credenciales inválidas');
  }

  const isMatch = await bcrypt.compare(user_password, rows[0].user_password);
  if (!isMatch) {
    throw new Error('Credenciales inválidas');
  }

  const token = generateToken({ ...rows[0], isAdmin: true });
  return token;
};

// Obtener todos los administradores
const getAllAdminsService = async () => {
  const result = await pool.query('SELECT user_code, user_name, user_surname, user_email, is_superadmin FROM dep_admin');
  return result.rows;
};

// Actualizar información de un administrador
const updateAdminService = async (id, { user_name, user_surname, user_email, user_password }) => {
  const hashedPassword = user_password ? await bcrypt.hash(user_password, 10) : undefined;

  const result = await pool.query(
    `UPDATE dep_admin SET
      user_name = $1,
      user_surname = $2,
      user_email = $3,
      user_password = COALESCE($4, user_password)
      WHERE user_code = $5 RETURNING user_code, user_name, user_surname, user_email, is_superadmin`,
    [user_name, user_surname, user_email, hashedPassword, id]
  );

  if (result.rows.length === 0) {
    throw new Error('Administrador no encontrado');
  }

  return result.rows[0];
};

module.exports = {
  registerAdminService,
  loginAdminService,
  getAllAdminsService,
  updateAdminService,
};
