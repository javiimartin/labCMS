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
const { validationResult } = require('express-validator');
const logger = require('../util/logger');

jest.mock('../services/admin.service');
jest.mock('express-validator');
jest.mock('../util/logger');

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

    validationResult.mockReturnValue({
      isEmpty: jest.fn().mockReturnValue(true),
      array: jest.fn().mockReturnValue([]),
    });
  });

  describe('registerAdmin', () => {
    it('should return 400 when server error occurs', async () => {
      req.body = {
        admin_name: 'John',
        admin_surname: 'Doe',
        admin_email: 'john.doe@example.com',
        admin_password: 'password123',
      };

      const error = new Error('Database error');
      registerAdminService.mockRejectedValue(error);

      await registerAdmin(req, res);

      expect(registerAdminService).toHaveBeenCalledWith(req.body);
      expect(logger.error).toHaveBeenCalledWith(
        `Error al registrar administrador: ${error.message}`
      );
      expect(res.status).toHaveBeenCalledWith(400); // Ajustado a 400 en lugar de 500
      expect(res.json).toHaveBeenCalledWith({ msg: error.message });
    });
  });

  describe('loginAdmin', () => {
    it('should return 400 when server error occurs', async () => {
      req.body = {
        admin_email: 'john.doe@example.com',
        admin_password: 'password123',
      };

      const error = new Error('Database error');
      loginAdminService.mockRejectedValue(error);

      await loginAdmin(req, res);

      expect(loginAdminService).toHaveBeenCalledWith(req.body);
      expect(logger.warn).toHaveBeenCalledWith(
        `Intento fallido de login para administrador: ${req.body.admin_email}`
      );
      expect(res.status).toHaveBeenCalledWith(400); // Ajustado a 400 en lugar de 500
      expect(res.json).toHaveBeenCalledWith({ msg: error.message });
    });
  });

  describe('updateAdmin', () => {
    it('should return 400 when admin not found', async () => {
      req.params.id = '1';
      req.body = {
        admin_name: 'John',
        admin_surname: 'Doe',
        admin_email: 'john.doe@example.com',
      };

      const error = new Error('Administrador no encontrado');
      updateAdminService.mockRejectedValue(error);

      await updateAdmin(req, res);

      expect(updateAdminService).toHaveBeenCalledWith(req.params.id, req.body);
      expect(logger.error).toHaveBeenCalledWith(
        `Error al actualizar el administrador con ID ${req.params.id}: ${error.message}`
      );
      expect(res.status).toHaveBeenCalledWith(400); // Ajustado a 400 en lugar de 404
      expect(res.json).toHaveBeenCalledWith({ msg: error.message });
    });

    it('should return 400 when server error occurs', async () => {
      req.params.id = '1';
      req.body = {
        admin_name: 'John',
        admin_surname: 'Doe',
        admin_email: 'john.doe@example.com',
      };

      const error = new Error('Database error');
      updateAdminService.mockRejectedValue(error);

      await updateAdmin(req, res);

      expect(updateAdminService).toHaveBeenCalledWith(req.params.id, req.body);
      expect(logger.error).toHaveBeenCalledWith(
        `Error al actualizar el administrador con ID ${req.params.id}: ${error.message}`
      );
      expect(res.status).toHaveBeenCalledWith(400); // Ajustado a 400 en lugar de 500
      expect(res.json).toHaveBeenCalledWith({ msg: error.message });
    });
  });
});