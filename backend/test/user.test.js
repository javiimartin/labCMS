const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/user.controller');
const pool = require('../db');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const generateToken = require('../util/generateToken');

jest.mock('../db', () => ({
  query: jest.fn()
}));
jest.mock('bcrypt');
jest.mock('express-validator', () => ({
  validationResult: jest.fn()
}));
jest.mock('../util/generateToken', () => jest.fn());

describe('User Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('debería devolver error si el usuario ya existe', async () => {
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
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      validationResult.mockReturnValue({ isEmpty: jest.fn().mockReturnValue(true) });
      pool.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }] });

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'El usuario ya existe' });
    });
  });

  describe('getUserProfile', () => {
    it('debería devolver el perfil de usuario sin la contraseña', async () => {
      const req = { user: { user_id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      pool.query.mockResolvedValueOnce({
        rows: [{ user_id: 1, user_name: 'Jane', user_password: 'hashedPassword' }]
      });

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
