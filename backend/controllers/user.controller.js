const { validationResult } = require('express-validator');
const {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserById,
  comparePasswords,
  generateToken,
} = require('../services/user.service');
const logger = require('../logger');

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`Validation error in registerUser: ${JSON.stringify(errors.array())}`);
    return res.status(400).json({ errors: errors.array() });
  }

  const userData = req.body;

  if (isNaN(userData.user_age)) {
    logger.warn(`Invalid user_age (${userData.user_age}) in registerUser`);
    return res.status(400).json({ msg: 'Invalid user_age, it must be a number' });
  }

  try {
    const existingUser = await findUserByEmail(userData.user_email);
    if (existingUser) {
      logger.warn(`Attempt to register existing user: ${userData.user_email}`);
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    const newUser = await createUser(userData);
    const token = generateToken(newUser);

    logger.info(`User registered successfully: ${userData.user_email}`);
    return res.status(201).json({ token });
  } catch (error) {
    logger.error(`Error in registerUser: ${error.message}`);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

const loginUser = async (req, res) => {
  const { user_email, user_password } = req.body;

  try {
    const user = await findUserByEmail(user_email);
    if (!user) {
      logger.warn(`Login failed: User not found (${user_email})`);
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const isMatch = await comparePasswords(user_password, user.user_password);
    if (!isMatch) {
      logger.warn(`Login failed: Invalid password for user (${user_email})`);
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const token = generateToken(user);
    logger.info(`User logged in successfully: ${user_email}`);
    return res.status(200).json({ token });
  } catch (error) {
    logger.error(`Error in loginUser: ${error.message}`);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.user_id);
    if (!user) {
      logger.warn(`User profile not found for ID: ${req.user.user_id}`);
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    const { user_password, ...userProfile } = user;
    logger.info(`User profile retrieved for ID: ${req.user.user_id}`);
    return res.status(200).json(userProfile);
  } catch (error) {
    logger.error(`Error in getUserProfile: ${error.message}`);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

const updateUserProfile = async (req, res) => {
  const userData = req.body;

  if (userData.user_age && isNaN(userData.user_age)) {
    logger.warn(`Invalid user_age (${userData.user_age}) in updateUserProfile`);
    return res.status(400).json({ msg: 'Invalid user_age, it must be a number' });
  }

  try {
    const updatedUser = await updateUserById(req.user.user_id, userData);
    const { user_password, ...updatedUserProfile } = updatedUser;

    logger.info(`User profile updated for ID: ${req.user.user_id}`);
    return res.status(200).json(updatedUserProfile);
  } catch (error) {
    logger.error(`Error in updateUserProfile: ${error.message}`);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
