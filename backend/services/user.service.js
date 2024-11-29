const bcrypt = require('bcrypt');
const pool = require('../db');
const generateToken = require('../util/generateToken');

const findUserByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM dep_user WHERE user_email = $1', [email]);
  return rows[0];
};

const findUserById = async (userId) => {
  const { rows } = await pool.query('SELECT * FROM dep_user WHERE user_id = $1', [userId]);
  return rows[0];
};

const createUser = async (userData) => {
  const hashedPassword = await bcrypt.hash(userData.user_password, 10);
  const { rows } = await pool.query(
    'INSERT INTO dep_user (user_name, user_surname, user_email, user_password, user_gender, user_age, user_degree, user_zipcode, role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
    [
      userData.user_name,
      userData.user_surname,
      userData.user_email,
      hashedPassword,
      userData.user_gender,
      userData.user_age,
      userData.user_degree,
      userData.user_zipcode,
      'student',
    ]
  );
  return rows[0];
};

const updateUserById = async (userId, userData) => {
  const hashedPassword = userData.user_password
    ? await bcrypt.hash(userData.user_password, 10)
    : undefined;

  const { rows } = await pool.query(
    `UPDATE dep_user SET
      user_name = $1,
      user_surname = $2,
      user_email = $3,
      user_password = COALESCE($4, user_password),
      user_gender = $5,
      user_age = $6,
      user_degree = $7,
      user_zipcode = $8
      WHERE user_id = $9 RETURNING *`,
    [
      userData.user_name,
      userData.user_surname,
      userData.user_email,
      hashedPassword,
      userData.user_gender,
      userData.user_age,
      userData.user_degree,
      userData.user_zipcode,
      userId,
    ]
  );

  return rows[0];
};

const comparePasswords = async (inputPassword, storedPassword) => {
  return await bcrypt.compare(inputPassword, storedPassword);
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserById,
  comparePasswords,
  generateToken,
};
