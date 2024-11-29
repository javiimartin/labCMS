const { validationResult } = require('express-validator');
const {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserById,
  comparePasswords,
  generateToken,
} = require('../services/user.service');

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userData = req.body;

  if (isNaN(userData.user_age)) {
    return res.status(400).json({ msg: 'Invalid user_age, it must be a number' });
  }

  try {
    const existingUser = await findUserByEmail(userData.user_email);
    if (existingUser) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    const newUser = await createUser(userData);
    const token = generateToken(newUser);

    return res.status(201).json({ token });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

const loginUser = async (req, res) => {
  const { user_email, user_password } = req.body;

  try {
    const user = await findUserByEmail(user_email);
    if (!user) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const isMatch = await comparePasswords(user_password, user.user_password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const token = generateToken(user);
    return res.status(200).json({ token });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.user_id);
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    const { user_password, ...userProfile } = user;
    return res.status(200).json(userProfile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

const updateUserProfile = async (req, res) => {
  const userData = req.body;

  if (userData.user_age && isNaN(userData.user_age)) {
    return res.status(400).json({ msg: 'Invalid user_age, it must be a number' });
  }

  try {
    const updatedUser = await updateUserById(req.user.user_id, userData);
    const { user_password, ...updatedUserProfile } = updatedUser;

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
  updateUserProfile,
};
