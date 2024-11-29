// test/admin.test.js

// Mocks necesarios antes de cualquier require
jest.mock('../db', () => ({
  query: jest.fn(),
}));
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

jest.mock('../services/admin.service', () => ({
  registerAdminService: jest.fn(),
  loginAdminService: jest.fn(),
  getAllAdminsService: jest.fn(),
  updateAdminService: jest.fn(),
}));

// Importación de módulos
const {
  registerAdmin,
  loginAdmin,
  getAllAdmins,
  updateAdmin,
} = require('../controllers/admin.controller');
const {
  registerAdminService,
  loginAdminService,
  getAllAdminsService,
  updateAdminService,
} = require('../services/admin.service');
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

describe('Admin Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  describe('registerAdmin', () => {
    it('debería registrar un nuevo administrador y devolver un token', async () => {
      req.body = {
        admin_name: 'John',
        admin_surname: 'Doe',
        admin_email: 'john.doe@example.com',
        admin_password: 'password123',
      };

      validationResult.mockReturnValue({ isEmpty: () => true });

      registerAdminService.mockResolvedValue('token');

      await registerAdmin(req, res);

      expect(registerAdminService).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ token: 'token' });
    });

    it('debería devolver un error si el administrador ya existe', async () => {
      req.body = {
        admin_email: 'john.doe@example.com',
      };

      validationResult.mockReturnValue({ isEmpty: () => true });

      registerAdminService.mockRejectedValue(new Error('El administrador ya existe'));

      await registerAdmin(req, res);

      expect(registerAdminService).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'El administrador ya existe' });
    });

    it('debería manejar errores del servidor', async () => {
      req.body = {
        admin_email: 'john.doe@example.com',
      };

      validationResult.mockReturnValue({ isEmpty: () => true });

      registerAdminService.mockRejectedValue(new Error('Database error'));

      await registerAdmin(req, res);

      expect(registerAdminService).toHaveBeenCalledWith(req.body);
      expect(console.error).toHaveBeenCalledWith('Error en registerAdmin:', 'Database error');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Error en el servidor' });
    });
  });

  describe('loginAdmin', () => {
    it('debería iniciar sesión y devolver un token', async () => {
      req.body = {
        admin_email: 'john.doe@example.com',
        admin_password: 'password123',
      };

      pool.query.mockResolvedValueOnce({
        rows: [{ admin_id: 1, admin_password: 'hashedPassword', admin_email: 'john.doe@example.com' }],
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('token');

      await loginAdmin(req, res, next);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(jwt.sign).toHaveBeenCalledWith(
        { admin_id: 1, admin_password: 'hashedPassword', admin_email: 'john.doe@example.com', isAdmin: true },
        expect.any(String),
        { expiresIn: '1h' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ token: 'token' });
    });

    it('debería devolver un error si las credenciales son inválidas', async () => {
      req.body = {
        admin_email: 'john.doe@example.com',
        admin_password: 'password123',
      };

      pool.query.mockResolvedValueOnce({ rows: [] }); // No se encontró el administrador

      await loginAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Credenciales inválidas' });
    });

    it('debería manejar errores del servidor', async () => {
      req.body = {
        admin_email: 'john.doe@example.com',
        admin_password: 'password123',
      };

      pool.query.mockRejectedValue(new Error('Database error'));

      await loginAdmin(req, res, next);

      expect(console.error).toHaveBeenCalledWith('Database error');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Error en el servidor' });
    });
  });

  describe('getAllAdmins', () => {
    it('debería devolver una lista de administradores', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [
          { admin_id: 1, admin_name: 'John', admin_surname: 'Doe', admin_email: 'john.doe@example.com' },
          { admin_id: 2, admin_name: 'Jane', admin_surname: 'Smith', admin_email: 'jane.smith@example.com' },
        ],
      });

      await getAllAdmins(req, res, next);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { admin_id: 1, admin_name: 'John', admin_surname: 'Doe', admin_email: 'john.doe@example.com' },
        { admin_id: 2, admin_name: 'Jane', admin_surname: 'Smith', admin_email: 'jane.smith@example.com' },
      ]);
    });

    it('debería manejar errores del servidor', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await getAllAdmins(req, res, next);

      expect(console.error).toHaveBeenCalledWith('Database error');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Error en el servidor' });
    });
  });

  describe('updateAdmin', () => {
    it('debería actualizar un administrador existente', async () => {
      req.params.id = '1';
      req.body = {
        admin_name: 'John',
        admin_surname: 'Doe',
        admin_email: 'john.doe@example.com',
        admin_password: 'newpassword123',
      };

      validationResult.mockReturnValue({ isEmpty: () => true });

      bcrypt.hash.mockResolvedValue('newHashedPassword');
      pool.query.mockResolvedValueOnce({
        rows: [{ admin_id: 1, admin_name: 'John', admin_surname: 'Doe', admin_email: 'john.doe@example.com' }],
      });

      await updateAdmin(req, res, next);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        admin_id: 1,
        admin_name: 'John',
        admin_surname: 'Doe',
        admin_email: 'john.doe@example.com',
      });
    });

    it('debería devolver un error si el administrador no es encontrado', async () => {
      req.params.id = '999';
      req.body = {
        admin_name: 'John',
        admin_surname: 'Doe',
      };

      validationResult.mockReturnValue({ isEmpty: () => true });

      pool.query.mockResolvedValueOnce({ rows: [] });

      await updateAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Administrador no encontrado' });
    });

    it('debería manejar errores de validación', async () => {
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid input' }],
      });

      await updateAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid input', errors: [{ msg: 'Invalid input' }] });
    });

    it('debería manejar errores del servidor', async () => {
      req.params.id = '1';
      req.body = {
        admin_name: 'John',
        admin_surname: 'Doe',
      };

      validationResult.mockReturnValue({ isEmpty: () => true });

      pool.query.mockRejectedValue(new Error('Database error'));

      await updateAdmin(req, res, next);

      expect(console.error).toHaveBeenCalledWith('Database error');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Error en el servidor' });
    });
  });
});
