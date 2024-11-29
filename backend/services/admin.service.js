const bcrypt = require('bcrypt');
const pool = require('../db');
const generateToken = require('../util/generateToken');

const registerAdminService = async ({ admin_name, admin_surname, admin_email, admin_password }) => {
  if (!/^\S+@\S+\.\S+$/.test(admin_email)) {
    throw new Error('Invalid input');
  }

  const { rows } = await pool.query('SELECT * FROM dep_admin WHERE admin_email = $1', [admin_email]);
  if (rows.length > 0) {
    throw new Error('El administrador ya existe');
  }

  const hashedPassword = await bcrypt.hash(admin_password, 10);
  const newAdmin = await pool.query(
    'INSERT INTO dep_admin (admin_name, admin_surname, admin_email, admin_password) VALUES ($1, $2, $3, $4) RETURNING *',
    [admin_name, admin_surname, admin_email, hashedPassword]
  );

  return generateToken({ ...newAdmin.rows[0], isAdmin: true });
};

const loginAdminService = async ({ admin_email, admin_password }) => {
  const { rows } = await pool.query('SELECT * FROM dep_admin WHERE admin_email = $1', [admin_email]);
  if (rows.length === 0) {
    throw new Error('Credenciales inválidas');
  }

  const isMatch = await bcrypt.compare(admin_password, rows[0].admin_password);
  if (!isMatch) {
    throw new Error('Credenciales inválidas');
  }

  return generateToken({ ...rows[0], isAdmin: true });
};

const getAllAdminsService = async () => {
  const admins = await pool.query('SELECT * FROM dep_admin');
  return admins.rows.map((admin) => {
    const { admin_password, ...adminInfo } = admin;
    return adminInfo;
  });
};

const updateAdminService = async (id, { admin_name, admin_surname, admin_email, admin_password }) => {
  if (admin_email && !/^\S+@\S+\.\S+$/.test(admin_email)) {
    throw new Error('Invalid input');
  }

  if (admin_password && admin_password.length < 6) {
    throw new Error('Invalid input');
  }

  const hashedPassword = admin_password ? await bcrypt.hash(admin_password, 10) : undefined;

  const { rows } = await pool.query(
    `UPDATE dep_admin SET
      admin_name = $1,
      admin_surname = $2,
      admin_email = $3,
      admin_password = COALESCE($4, admin_password)
      WHERE admin_id = $5 RETURNING *`,
    [admin_name, admin_surname, admin_email, hashedPassword, id]
  );

  if (rows.length === 0) {
    throw new Error('Administrador no encontrado');
  }

  const { admin_password: _, ...adminData } = rows[0];
  return adminData;
};

module.exports = {
  registerAdminService,
  loginAdminService,
  getAllAdminsService,
  updateAdminService,
};
