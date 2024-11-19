const bcrypt = require('bcrypt');
const pool = require('../db');
const { validationResult } = require('express-validator');
const generateToken = require('../util/generateToken');

// Registro de usuario
const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { user_name, user_surname, user_email, user_password, user_gender, user_age, user_degree, user_zipcode } = req.body;

  if (isNaN(user_age)) {
    return res.status(400).json({ msg: 'Invalid user_age, it must be a number' });
  }

  try {
    // Verificar si el usuario ya existe
    const { rows } = await pool.query('SELECT * FROM dep_user WHERE user_email = $1', [user_email]);
    if (rows.length > 0) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    // Hashear la contraseña e insertar nuevo usuario
    const hashedPassword = await bcrypt.hash(user_password, 10);
    const newUser = await pool.query(
      'INSERT INTO dep_user (user_name, user_surname, user_email, user_password, user_gender, user_age, user_degree, user_zipcode, role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [user_name, user_surname, user_email, hashedPassword, user_gender, user_age, user_degree, user_zipcode, 'student'] // Asignación del rol
    );

    // Generar y enviar token JWT
    const token = generateToken(newUser.rows[0]);
    return res.status(201).json({ token });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Login de usuario
const loginUser = async (req, res) => {
  const { user_email, user_password } = req.body;

  try {
    // Verificar si el usuario existe
    const { rows } = await pool.query('SELECT * FROM dep_user WHERE user_email = $1', [user_email]);
    if (rows.length === 0) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Comparar la contraseña
    const isMatch = await bcrypt.compare(user_password, rows[0].user_password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Generar y enviar token JWT
    const token = generateToken(rows[0]);
    return res.status(200).json({ token });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Obtener perfil del usuario
const getUserProfile = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM dep_user WHERE user_id = $1', [req.user.user_id]);

    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Excluir la contraseña del perfil de usuario antes de enviarlo
    const { user_password, ...userProfile } = rows[0];
    return res.status(200).json(userProfile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Actualizar perfil del usuario
const updateUserProfile = async (req, res) => {
  const { user_name, user_surname, user_email, user_password, user_gender, user_age, user_degree, user_zipcode } = req.body;

  if (user_age && isNaN(user_age)) {
    return res.status(400).json({ msg: 'Invalid user_age, it must be a number' });
  }

  try {
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
      [user_name, user_surname, user_email, hashedPassword, user_gender, user_age, user_degree, user_zipcode, req.user.user_id]
    );

    // Excluir la contraseña del perfil de usuario actualizado
    const { user_password: _, ...updatedUserProfile } = rows[0];
    return res.status(200).json(updatedUserProfile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
};