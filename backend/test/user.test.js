const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('./path_to_controller');
const pool = require('../db');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

jest.mock('../db');
jest.mock('bcrypt');
jest.mock('express-validator');

describe('User Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('debería registrar un nuevo usuario y devolver un token', async () => {
      const req = {
        body: {
          user_name: 'Jane',
          user_surname: 'Doe',
          user_email: 'jane.doe@example.com',
          user_password: 'password123',
          user_gender: 'F',
          user_age: 25,
          user_degree: 'Computer Science',
          user_zipcode: '12345'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      validationResult.mockReturnValue({ isEmpty: jest.fn().mockReturnValue(true) });
      pool.query.mockResolvedValueOnce({ rows: [] }); // No hay usuario existente
      bcrypt.hash.mockResolvedValueOnce('hashedPassword'); // Mock del hash
      pool.query.mockResolvedValueOnce({ rows: [{ user_id: 1, user_name: 'Jane', user_email: 'jane.doe@example.com' }] }); // Mock de inserción

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: expect.any(String) }));
    });

    it('debería devolver error si el usuario ya existe', async () => {
      const req = { body: { user_email: 'jane.doe@example.com' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      validationResult.mockReturnValue({ isEmpty: jest.fn().mockReturnValue(true) });
      pool.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }] });

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'El usuario ya existe' });
    });
  });

  describe('loginUser', () => {
    it('debería autenticar y devolver un token', async () => {
      const req = { body: { user_email: 'jane.doe@example.com', user_password: 'password123' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      pool.query.mockResolvedValueOnce({ rows: [{ user_password: 'hashedPassword' }] });
      bcrypt.compare.mockResolvedValueOnce(true);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: expect.any(String) }));
    });

    it('debería devolver error si las credenciales son incorrectas', async () => {
      const req = { body: { user_email: 'jane.doe@example.com', user_password: 'wrongpassword' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      pool.query.mockResolvedValueOnce({ rows: [{ user_password: 'hashedPassword' }] });
      bcrypt.compare.mockResolvedValueOnce(false);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Credenciales inválidas' });
    });
  });

  describe('getUserProfile', () => {
    it('debería devolver el perfil de usuario sin la contraseña', async () => {
      const req = { user: { user_id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      pool.query.mockResolvedValueOnce({ rows: [{ user_id: 1, user_name: 'Jane', user_password: 'hashedPassword' }] });

      await getUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ user_id: 1, user_name: 'Jane' });
    });

    it('debería devolver un error si el usuario no es encontrado', async () => {
      const req = { user: { user_id: 999 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      pool.query.mockResolvedValueOnce({ rows: [] });

      await getUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Usuario no encontrado' });
    });
  });
});
