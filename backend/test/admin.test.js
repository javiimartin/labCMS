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
    it('should register an admin successfully', async () => {
      const token = 'fake-jwt-token';
      req.body = {
        admin_name: 'John',
        admin_surname: 'Doe',
        admin_email: 'john.doe@example.com',
        admin_password: 'password123',
      };

      registerAdminService.mockResolvedValue(token);

      await registerAdmin(req, res);

      expect(validationResult).toHaveBeenCalledWith(req);
      expect(registerAdminService).toHaveBeenCalledWith(req.body);
      expect(logger.info).toHaveBeenCalledWith(
        `Administrador registrado con éxito: ${req.body.admin_email}`
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ token });
    });

    it('should return 400 when validation fails', async () => {
      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([{ msg: 'Invalid input' }]),
      });

      await registerAdmin(req, res);

      expect(validationResult).toHaveBeenCalledWith(req);
      expect(logger.warn).toHaveBeenCalledWith(
        'Intento de registro de administrador con datos inválidos',
        { errors: [{ msg: 'Invalid input' }] }
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Invalid input',
        errors: [{ msg: 'Invalid input' }],
      });
    });

    it('should return 400 when admin already exists', async () => {
      req.body = {
        admin_name: 'John',
        admin_surname: 'Doe',
        admin_email: 'john.doe@example.com',
        admin_password: 'password123',
      };

      const error = new Error('El administrador ya existe');
      registerAdminService.mockRejectedValue(error);

      await registerAdmin(req, res);

      expect(registerAdminService).toHaveBeenCalledWith(req.body);
      expect(logger.error).toHaveBeenCalledWith(
        `Error al registrar administrador: ${error.message}`
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: error.message });
    });

    it('should return 500 when server error occurs', async () => {
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
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Error en el servidor' });
    });
  });

  describe('loginAdmin', () => {
    it('should login admin successfully', async () => {
      const token = 'fake-jwt-token';
      req.body = {
        admin_email: 'john.doe@example.com',
        admin_password: 'password123',
      };

      loginAdminService.mockResolvedValue(token);

      await loginAdmin(req, res);

      expect(loginAdminService).toHaveBeenCalledWith(req.body);
      expect(logger.info).toHaveBeenCalledWith(
        `Administrador inició sesión: ${req.body.admin_email}`
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ token });
    });

    it('should return 400 when credentials are invalid', async () => {
      req.body = {
        admin_email: 'john.doe@example.com',
        admin_password: 'wrongpassword',
      };

      const error = new Error('Credenciales inválidas');
      loginAdminService.mockRejectedValue(error);

      await loginAdmin(req, res);

      expect(loginAdminService).toHaveBeenCalledWith(req.body);
      expect(logger.warn).toHaveBeenCalledWith(
        `Intento fallido de login para administrador: ${req.body.admin_email}`
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: error.message });
    });

    it('should return 500 when server error occurs', async () => {
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
      expect(logger.error).toHaveBeenCalledWith(
        `Error en loginAdmin: ${error.message}`
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Error en el servidor' });
    });
  });

  describe('getAllAdmins', () => {
    it('should get all admins successfully', async () => {
      const admins = [
        {
          admin_id: 1,
          admin_name: 'John',
          admin_surname: 'Doe',
          admin_email: 'john.doe@example.com',
        },
        {
          admin_id: 2,
          admin_name: 'Jane',
          admin_surname: 'Smith',
          admin_email: 'jane.smith@example.com',
        },
      ];

      getAllAdminsService.mockResolvedValue(admins);

      await getAllAdmins(req, res);

      expect(getAllAdminsService).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        'Consulta realizada para obtener todos los administradores'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(admins);
    });

    it('should return 500 when server error occurs', async () => {
      const error = new Error('Database error');
      getAllAdminsService.mockRejectedValue(error);

      await getAllAdmins(req, res);

      expect(getAllAdminsService).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        `Error al obtener los administradores: ${error.message}`
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Error en el servidor' });
    });
  });

  describe('updateAdmin', () => {
    it('should update admin successfully', async () => {
      req.params.id = '1';
      req.body = {
        admin_name: 'John',
        admin_surname: 'Doe',
        admin_email: 'john.doe@example.com',
      };

      const updatedAdmin = {
        admin_id: 1,
        admin_name: 'John',
        admin_surname: 'Doe',
        admin_email: 'john.doe@example.com',
      };

      updateAdminService.mockResolvedValue(updatedAdmin);

      await updateAdmin(req, res);

      expect(validationResult).toHaveBeenCalledWith(req);
      expect(updateAdminService).toHaveBeenCalledWith(req.params.id, req.body);
      expect(logger.info).toHaveBeenCalledWith(
        `Administrador actualizado con ID: ${req.params.id}`
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedAdmin);
    });

    it('should return 400 when validation fails', async () => {
      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([{ msg: 'Invalid input' }]),
      });

      await updateAdmin(req, res);

      expect(validationResult).toHaveBeenCalledWith(req);
      expect(logger.warn).toHaveBeenCalledWith(
        'Intento de actualización de administrador con datos inválidos',
        { errors: [{ msg: 'Invalid input' }] }
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        msg: 'Invalid input',
        errors: [{ msg: 'Invalid input' }],
      });
    });

    it('should return 404 when admin not found', async () => {
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
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: error.message });
    });

    it('should return 500 when server error occurs', async () => {
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
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Error en el servidor' });
    });
  });
});
