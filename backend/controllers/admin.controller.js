const bcrypt = require('bcrypt');
const pool = require('../db');
const { validationResult } = require('express-validator');
const generateToken = require('../util/generateToken');

// Registro de administrador
// Registro de administrador
const registerAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: 'Invalid input', errors: errors.array() });
  }

  const { admin_name, admin_surname, admin_email, admin_password } = req.body;

  // Validar formato de email
  if (!/^\S+@\S+\.\S+$/.test(admin_email)) {
    return res.status(400).json({ msg: 'Invalid input' });
  }

  try {
    // Verificar si el administrador ya existe
    const { rows } = await pool.query('SELECT * FROM dep_admin WHERE admin_email = $1', [admin_email]);
    if (rows.length > 0) {
      return res.status(400).json({ msg: 'El administrador ya existe' });
    }

    // Hashear la contraseña e insertar nuevo administrador
    const hashedPassword = await bcrypt.hash(admin_password, 10);
    const newAdmin = await pool.query(
      'INSERT INTO dep_admin (admin_name, admin_surname, admin_email, admin_password) VALUES ($1, $2, $3, $4) RETURNING *',
      [admin_name, admin_surname, admin_email, hashedPassword]
    );

    // Generar y enviar token JWT
    const token = generateToken({ ...newAdmin.rows[0], isAdmin: true });
    return res.status(201).json({ token });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Login de administrador
const loginAdmin = async (req, res) => {
  const { admin_email, admin_password } = req.body;

  try {
    // Verificar si el administrador existe
    const { rows } = await pool.query('SELECT * FROM dep_admin WHERE admin_email = $1', [admin_email]);
    if (rows.length === 0) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Comparar la contraseña
    const isMatch = await bcrypt.compare(admin_password, rows[0].admin_password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Generar y enviar token JWT
    const token = generateToken({ ...rows[0], isAdmin: true });
    return res.status(200).json({ token });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Obtener todos los administradores
const getAllAdmins = async (req, res) => {
  try {
    const admins = await pool.query('SELECT * FROM dep_admin');
    const adminData = admins.rows.map(admin => {
      const { admin_password, ...adminInfo } = admin;
      return adminInfo;
    });
    return res.status(200).json(adminData);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Actualizar información de un administrador con validación
const updateAdmin = async (req, res) => {
  // Validación directa en el controlador
  const { admin_name, admin_surname, admin_email, admin_password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ msg: 'Invalid input', errors: errors.array() });
  }

  try {
    const hashedPassword = admin_password ? await bcrypt.hash(admin_password, 10) : undefined;
    
    // Aquí las validaciones específicas que necesitas (más sencillas)
    if (admin_email && !/^\S+@\S+\.\S+$/.test(admin_email)) {
      return res.status(400).json({ msg: 'Invalid input' });  // Cambié el mensaje a 'Invalid input'
    }

    if (admin_password && admin_password.length < 6) {
      return res.status(400).json({ msg: 'Invalid input' });  // Cambié el mensaje a 'Invalid input'
    }

    const { rows } = await pool.query(
      `UPDATE dep_admin SET
        admin_name = $1,
        admin_surname = $2,
        admin_email = $3,
        admin_password = COALESCE($4, admin_password)
        WHERE admin_id = $5 RETURNING *`,
      [admin_name, admin_surname, admin_email, hashedPassword, req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ msg: 'Administrador no encontrado' });
    }

    // Excluir la contraseña del perfil de administrador actualizado
    const { admin_password: _, ...adminData } = rows[0];
    return res.status(200).json(adminData);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ msg: 'Error en el servidor' });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAllAdmins,
  updateAdmin
};