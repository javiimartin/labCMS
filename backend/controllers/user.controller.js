const { validationResult } = require('express-validator');
const logger = require('../util/logger');
const {
  registerUserService,
  loginUserService,
  getUserProfileService,
  updateUserProfileService,
} = require('../services/user.service');

// Registro de usuario
const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Intento de registro de usuario con datos inválidos', { errors: errors.array() });
    return res.status(400).json({ msg: errors.array()[0].msg, errors: errors.array() });
  }

  const {
    user_name,
    user_surname,
    user_email,
    user_password,
    user_gender,
    user_age,
    user_degree,
    user_zipcode,
  } = req.body;

  try {
    const token = await registerUserService({
      user_name,
      user_surname,
      user_email,
      user_password,
      user_gender,
      user_age,
      user_degree,
      user_zipcode,
    });
    logger.info(`Usuario registrado con éxito: ${user_email}`);
    return res.status(201).json({ token });
  } catch (error) {
    logger.error(`Error al registrar usuario: ${error.message}`);
    if (error.message === 'El usuario ya existe') {
      return res.status(400).json({ msg: error.message });
    } else {
      return res.status(500).json({ msg: 'Error en el servidor' });
    }
  }
};

// Login de usuario
const loginUser = async (req, res) => {
  const { user_email, user_password } = req.body;

  try {
    const token = await loginUserService(user_email, user_password);
    logger.info(`Usuario inició sesión: ${user_email}`);
    return res.status(200).json({ token });
  } catch (error) {
    logger.warn(`Intento fallido de login para usuario: ${user_email}`);
    if (error.message === 'Credenciales inválidas') {
      return res.status(400).json({ msg: error.message });
    } else {
      return res.status(500).json({ msg: 'Error en el servidor' });
    }
  }
};

// Obtener perfil del usuario
const getUserProfile = async (req, res) => {
  try {
    const userProfile = await getUserProfileService(req.user.user_id);
    logger.info(`Consulta del perfil del usuario ID: ${req.user.user_id}`);
    return res.status(200).json(userProfile);
  } catch (error) {
    logger.error(`Error al obtener el perfil del usuario ID ${req.user.user_id}: ${error.message}`);
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({ msg: error.message });
    } else {
      return res.status(500).json({ msg: 'Error en el servidor' });
    }
  }
};

// Actualizar perfil del usuario
const updateUserProfile = async (req, res) => {
  const {
    user_name,
    user_surname,
    user_email,
    user_password,
    user_gender,
    user_age,
    user_degree,
    user_zipcode,
  } = req.body;

  if (user_age && isNaN(user_age)) {
    logger.warn('Intento de actualización de perfil con un valor no numérico para user_age');
    return res.status(400).json({ msg: 'Invalid user_age, it must be a number' });
  }

  try {
    const updatedProfile = await updateUserProfileService(req.user.user_id, {
      user_name,
      user_surname,
      user_email,
      user_password,
      user_gender,
      user_age,
      user_degree,
      user_zipcode,
    });
    logger.info(`Perfil actualizado con éxito para usuario ID: ${req.user.user_id}`);
    return res.status(200).json(updatedProfile);
  } catch (error) {
    logger.error(`Error al actualizar el perfil del usuario ID ${req.user.user_id}: ${error.message}`);
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({ msg: error.message });
    } else {
      return res.status(500).json({ msg: 'Error en el servidor' });
    }
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};