const { registerAdmin, loginAdmin, getAllAdmins, updateAdmin } = require('../controllers/admin.controller');
const pool = require('../db');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

jest.mock('../db');
jest.mock('bcrypt');
jest.mock('express-validator');

describe('Admin Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerAdmin', () => {
    it('debería registrar un nuevo administrador y devolver un token', async () => {
      const req = {
        body: {
          admin_name: 'John',
          admin_surname: 'Doe',
          admin_email: 'john.doe@example.com',
          admin_password: 'password123'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      validationResult.mockReturnValue({ isEmpty: jest.fn().mockReturnValue(true) });
      pool.query.mockResolvedValueOnce({ rows: [] }); // No hay administrador existente
      bcrypt.hash.mockResolvedValueOnce('hashedPassword'); // Mock del hash
      pool.query.mockResolvedValueOnce({ rows: [{ admin_id: 1, admin_name: 'John', admin_email: 'john.doe@example.com' }] }); // Mock de inserción

      await registerAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: expect.any(String) }));
    });

    it('debería devolver error si el administrador ya existe', async () => {
      const req = {
        body: { admin_email: 'john.doe@example.com' }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      validationResult.mockReturnValue({ isEmpty: jest.fn().mockReturnValue(true) });
      pool.query.mockResolvedValueOnce({ rows: [{ admin_id: 1 }] });

      await registerAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'El administrador ya existe' });
    });
  });

  describe('loginAdmin', () => {
    it('debería autenticar y devolver un token', async () => {
      const req = { body: { admin_email: 'john.doe@example.com', admin_password: 'password123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      pool.query.mockResolvedValueOnce({ rows: [{ admin_password: 'hashedPassword' }] });
      bcrypt.compare.mockResolvedValueOnce(true);

      await loginAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: expect.any(String) }));
    });

    it('debería devolver error si las credenciales son incorrectas', async () => {
      const req = { body: { admin_email: 'john.doe@example.com', admin_password: 'wrongpassword' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      pool.query.mockResolvedValueOnce({ rows: [{ admin_password: 'hashedPassword' }] });
      bcrypt.compare.mockResolvedValueOnce(false);

      await loginAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Credenciales inválidas' });
    });
  });

  describe('getAllAdmins', () => {
    it('debería devolver todos los administradores excluyendo las contraseñas', async () => {
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      pool.query.mockResolvedValueOnce({
        rows: [
          { admin_id: 1, admin_name: 'John', admin_password: 'hashedPassword' },
          { admin_id: 2, admin_name: 'Jane', admin_password: 'hashedPassword' }
        ]
      });

      await getAllAdmins(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { admin_id: 1, admin_name: 'John' },
        { admin_id: 2, admin_name: 'Jane' }
      ]);
    });
  });
});
