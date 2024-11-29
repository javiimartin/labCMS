// admin.test.js

const request = require('supertest');
const express = require('express');
const adminRouter = require('../routes/admin.routes');
const bcrypt = require('bcrypt');
const pool = require('../db');
const jwt = require('jsonwebtoken');
const generateToken = require('../util/generateToken');

jest.mock('bcrypt');
jest.mock('../db');
jest.mock('../util/generateToken', () => jest.fn().mockReturnValue('mockToken'));

const app = express();
app.use(express.json());
app.use('/api/admin', adminRouter);

describe('Admin Routes', () => {
  const newAdmin = {
    admin_name: 'Admin',
    admin_surname: 'User',
    admin_email: 'adminuser@example.com',
    admin_password: 'password123'
  };

  const updatedAdmin = {
    admin_name: 'Updated',
    admin_surname: 'Admin',
    admin_email: 'updatedadmin@example.com'
  };

  // Mockear console.error y console.log para evitar mensajes durante las pruebas
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;

  beforeAll(() => {
    console.error = jest.fn();
    console.log = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  beforeEach(() => {
    jwt.verify = jest.fn((token, secret, callback) => {
      callback(null, { admin_id: 1, role: 'admin' }); // Mock de verificación de token como administrador
    });

    pool.query.mockReset();
    pool.query.mockResolvedValue({ rows: [] }); // Evitar errores al destructurar 'rows'
  });

  describe('POST /register', () => {
    it('should register a new admin with valid data', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // Verificar si el admin existe
        .mockResolvedValueOnce({ rows: [{ admin_id: 1, ...newAdmin, admin_password: 'hashedPassword' }] }); // Insertar nuevo admin

      bcrypt.hash.mockResolvedValueOnce('hashedPassword');

      const response = await request(app)
        .post('/api/admin/register')
        .send(newAdmin);

      expect(response.status).toBe(201);
      expect(response.body.token).toBe('mockToken');
      expect(generateToken).toHaveBeenCalledWith(expect.objectContaining({ admin_id: 1, admin_email: 'adminuser@example.com' }));
    });

    it('should return 400 if admin already exists', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ admin_email: 'adminuser@example.com' }] }); // Admin ya existe

      const response = await request(app)
        .post('/api/admin/register')
        .send(newAdmin);

      expect(response.status).toBe(400);
      expect(response.body.msg).toBe('El administrador ya existe');
    });

    it('should return 400 for invalid input', async () => {
      const invalidAdmin = { ...newAdmin, admin_email: 'invalid-email' };

      const response = await request(app)
        .post('/api/admin/register')
        .send(invalidAdmin);

      expect(response.status).toBe(400);
      expect(response.body.msg).toBe('Invalid input');
    });

    it('should return 500 on database error', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .post('/api/admin/register')
        .send(newAdmin);

      expect(response.status).toBe(500);
      expect(response.body.msg).toBe('Error en el servidor');
    });
  });

  describe('POST /login', () => {
    it('should login admin with correct credentials', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ admin_email: 'adminuser@example.com', admin_password: 'hashedPassword' }] });
      bcrypt.compare.mockResolvedValueOnce(true);

      const response = await request(app).post('/api/admin/login').send({
        admin_email: 'adminuser@example.com',
        admin_password: 'password123'
      });

      expect(response.status).toBe(200);
      expect(response.body.token).toBe('mockToken');
    });

    it('should return 400 if credentials are invalid', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ admin_email: 'adminuser@example.com', admin_password: 'hashedPassword' }] });
      bcrypt.compare.mockResolvedValueOnce(false);

      const response = await request(app).post('/api/admin/login').send({
        admin_email: 'adminuser@example.com',
        admin_password: 'wrongpassword'
      });

      expect(response.status).toBe(400);
      expect(response.body.msg).toBe('Credenciales inválidas');
    });

    it('should return 500 on server error', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).post('/api/admin/login').send({
        admin_email: 'adminuser@example.com',
        admin_password: 'password123'
      });

      expect(response.status).toBe(500);
      expect(response.body.msg).toBe('Error en el servidor');
    });
  });

  describe('Protected Routes', () => {
    describe('GET /admins', () => {
      it('should return all admins if authenticated', async () => {
        pool.query.mockResolvedValueOnce({
          rows: [
            { admin_id: 1, admin_name: 'Admin', admin_surname: 'User', admin_email: 'admin1@example.com' },
            { admin_id: 2, admin_name: 'Admin', admin_surname: 'Two', admin_email: 'admin2@example.com' }
          ]
        });

        const response = await request(app)
          .get('/api/admin/admins')
          .set('Authorization', 'Bearer mockToken');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body[0]).toMatchObject({ admin_name: 'Admin', admin_email: 'admin1@example.com' });
      });

      it('should return 500 on database error', async () => {
        pool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app)
          .get('/api/admin/admins')
          .set('Authorization', 'Bearer mockToken');

        expect(response.status).toBe(500);
        expect(response.body.msg).toBe('Error en el servidor');
      });
    });

    describe('PUT /admins/:id', () => {
      it('should update admin info with valid data', async () => {
        pool.query.mockResolvedValueOnce({
          rows: [{ admin_id: 1, ...updatedAdmin }]
        });

        const response = await request(app)
          .put('/api/admin/admins/1')
          .set('Authorization', 'Bearer mockToken')
          .send(updatedAdmin);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(updatedAdmin);
      });

      it('should return 404 if admin not found', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        const response = await request(app)
          .put('/api/admin/admins/999')
          .set('Authorization', 'Bearer mockToken')
          .send(updatedAdmin);

        expect(response.status).toBe(404);
        expect(response.body.msg).toBe('Administrador no encontrado');
      });

      it('should return 400 for invalid email format', async () => {
        const invalidData = { ...updatedAdmin, admin_email: 'invalid-email' };

        const response = await request(app)
          .put('/api/admin/admins/1')
          .set('Authorization', 'Bearer mockToken')
          .send(invalidData);

        expect(response.status).toBe(400);
        expect(response.body.msg).toBe('Invalid input');
      });

      it('should return 500 on database error', async () => {
        pool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app)
          .put('/api/admin/admins/1')
          .set('Authorization', 'Bearer mockToken')
          .send(updatedAdmin);

        expect(response.status).toBe(500);
        expect(response.body.msg).toBe('Error en el servidor');
      });
    });
  });
});