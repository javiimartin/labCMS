const bcrypt = require('bcrypt');
const pool = require('../db');
const generateToken = require('../util/generateToken');

const findAdminByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM dep_admin WHERE admin_email = $1', [email]);
  return rows[0];
};

const createAdmin = async (admin_name, admin_surname, admin_email, admin_password) => {
  const hashedPassword = await bcrypt.hash(admin_password, 10);
  const { rows } = await pool.query(
    'INSERT INTO dep_admin (admin_name, admin_surname, admin_email, admin_password) VALUES ($1, $2, $3, $4) RETURNING *',
    [admin_name, admin_surname, admin_email, hashedPassword]
  );
  return rows[0];
};

const getAllAdmins = async () => {
  const { rows } = await pool.query('SELECT * FROM dep_admin');
  return rows.map(({ admin_password, ...adminInfo }) => adminInfo); // Excluir la contraseña
};

const updateAdminById = async (id, admin_name, admin_surname, admin_email, admin_password) => {
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
  return rows[0];
};

const comparePasswords = async (inputPassword, hashedPassword) => {
  return await bcrypt.compare(inputPassword, hashedPassword);
};

module.exports = {
  findAdminByEmail,
  createAdmin,
  getAllAdmins,
  updateAdminById,
  comparePasswords,
  generateToken
};
