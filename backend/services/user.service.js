const bcrypt = require('bcrypt');
const pool = require('../db');
const generateToken = require('../util/generateToken');

// Registro de usuario
const registerUserService = async ({
  user_name,
  user_surname,
  user_email,
  user_password,
  user_gender,
  user_age,
  user_degree,
  user_zipcode,
}) => {
  const { rows } = await pool.query('SELECT * FROM dep_user WHERE user_email = $1', [user_email]);
  if (rows.length > 0) {
    throw new Error('El usuario ya existe');
  }

  const hashedPassword = await bcrypt.hash(user_password, 10);
  const { rows: newUser } = await pool.query(
    'INSERT INTO dep_user (user_name, user_surname, user_email, user_password, user_gender, user_age, user_degree, user_zipcode) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [user_name, user_surname, user_email, hashedPassword, user_gender, user_age, user_degree, user_zipcode]
  );

  return generateToken(newUser[0]);
};

// Login de usuario
const loginUserService = async (user_email, user_password) => {
  const { rows } = await pool.query('SELECT * FROM dep_user WHERE user_email = $1', [user_email]);
  if (rows.length === 0) {
    throw new Error('Credenciales inválidas');
  }

  const isMatch = await bcrypt.compare(user_password, rows[0].user_password);
  if (!isMatch) {
    throw new Error('Credenciales inválidas');
  }

  return generateToken(rows[0]);
};

// Obtener perfil del usuario
const getUserProfileService = async (user_id) => {
  const { rows } = await pool.query('SELECT * FROM dep_user WHERE user_id = $1', [user_id]);
  if (rows.length === 0) {
    throw new Error('Usuario no encontrado');
  }

  const { user_password, ...userProfile } = rows[0];
  return userProfile;
};

// Actualizar perfil del usuario
const updateUserProfileService = async (user_id, {
  user_name,
  user_surname,
  user_email,
  user_password,
  user_gender,
  user_age,
  user_degree,
  user_zipcode,
}) => {
  const { rows: existingUser } = await pool.query('SELECT * FROM dep_user WHERE user_id = $1', [user_id]);
  if (existingUser.length === 0) {
    throw new Error('Usuario no encontrado');
  }

  const hashedPassword = user_password ? await bcrypt.hash(user_password, 10) : undefined;

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
    [user_name, user_surname, user_email, hashedPassword, user_gender, user_age, user_degree, user_zipcode, user_id]
  );

  const { user_password: _, ...updatedUserProfile } = rows[0];
  return updatedUserProfile;
};

module.exports = {
  registerUserService,
  loginUserService,
  getUserProfileService,
  updateUserProfileService,
};