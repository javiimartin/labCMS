const request = require('supertest');
const express = require('express');
const userRouter = require('../src/routes/user.routes');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

jest.mock('bcrypt');
jest.mock('../config/db');
jest.mock('../src/util/generateToken', () => jest.fn().mockReturnValue('mockToken'));

const app = express();
app.use(express.json());
app.use('/api/users', userRouter);

describe('User Routes', () => {
  const newUser = {
    user_name: 'Test',
    user_surname: 'User',
    user_email: 'testuser@example.com',
    user_password: 'password123',
    user_gender: 'Male',
    user_age: 25,
    user_degree: 'Engineering',
    user_zipcode: '12345'
  };

  describe('POST /register', () => {
    it('should register a new user with valid data', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] }); // User does not exist
      bcrypt.hash.mockResolvedValueOnce('hashedPassword');
      pool.query.mockResolvedValueOnce({ rows: [{ user_id: 1, ...newUser, user_password: 'hashedPassword' }] });

      const response = await request(app).post('/api/users/register').send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.token).toBe('mockToken');
    });

    it('should return 400 if user already exists', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ user_email: 'testuser@example.com' }] });

      const response = await request(app).post('/api/users/register').send(newUser);

      expect(response.status).toBe(400);
      expect(response.body.msg).toBe('El usuario ya existe');
    });

    it('should return 400 if user_age is not a number', async () => {
        const invalidUser = { ...newUser, user_age: 'not-a-number' };
        
        const response = await request(app).post('/api/users/register').send(invalidUser);
        
        expect(response.status).toBe(400);
        expect(response.body.msg).toBe('Invalid user_age, it must be a number');
    });

    it('should return 500 on server error', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).post('/api/users/register').send(newUser);

      expect(response.status).toBe(500);
      expect(response.body.msg).toBe('Error en el servidor');
    });
  });

  describe('POST /login', () => {
    it('should login user with correct credentials', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ user_email: 'testuser@example.com', user_password: 'hashedPassword' }] });
      bcrypt.compare.mockResolvedValueOnce(true);

      const response = await request(app).post('/api/users/login').send({
        user_email: 'testuser@example.com',
        user_password: 'password123'
      });

      expect(response.status).toBe(200);
      expect(response.body.token).toBe('mockToken');
    });

    it('should return 400 if credentials are invalid', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ user_email: 'testuser@example.com', user_password: 'hashedPassword' }] });
      bcrypt.compare.mockResolvedValueOnce(false);

      const response = await request(app).post('/api/users/login').send({
        user_email: 'testuser@example.com',
        user_password: 'wrongpassword'
      });

      expect(response.status).toBe(400);
      expect(response.body.msg).toBe('Credenciales inválidas');
    });

    it('should return 500 on server error', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app).post('/api/users/login').send({
        user_email: 'testuser@example.com',
        user_password: 'password123'
      });

      expect(response.status).toBe(500);
      expect(response.body.msg).toBe('Error en el servidor');
    });
  });

  describe('Protected Routes', () => {
    beforeEach(() => {
      jwt.verify = jest.fn((token, secret, callback) => {
        callback(null, { user_id: 1, role: 'student' });
      });
    });

    describe('GET /profile', () => {
      it('should return user profile if authenticated', async () => {
        pool.query.mockResolvedValueOnce({
          rows: [{ user_id: 1, user_name: 'Test', user_email: 'testuser@example.com', user_password: 'hashedPassword' }]
        });

        const response = await request(app)
          .get('/api/users/profile')
          .set('Authorization', 'Bearer mockToken');

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ user_id: 1, user_name: 'Test', user_email: 'testuser@example.com' });
      });

      it('should return 404 if user not found', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        const response = await request(app)
          .get('/api/users/profile')
          .set('Authorization', 'Bearer mockToken');

        expect(response.status).toBe(404);
        expect(response.body.msg).toBe('Usuario no encontrado');
      });
    });

    describe('PUT /profile', () => {
        it('should update user profile with valid data', async () => {
          const updatedData = {
            user_name: 'Updated',
            user_surname: 'User',
            user_email: 'updateduser@example.com',
            user_age: 26,
            user_zipcode: '54321',
            user_gender: 'Male',
            user_degree: 'Engineering',
          };
      
          // Mock the SELECT query to get the existing user
          pool.query.mockResolvedValueOnce({
            rows: [{ user_id: 1, user_name: 'Test', user_email: 'testuser@example.com', user_password: 'hashedPassword' }]
          });
      
          // Mock the UPDATE query
          pool.query.mockResolvedValueOnce({
            rows: [{ user_id: 1, ...updatedData, user_password: 'hashedPassword' }]
          });
      
          const response = await request(app)
            .put('/api/users/profile')
            .set('Authorization', 'Bearer mockToken')
            .send(updatedData);
      
          expect(response.status).toBe(200);
          expect(response.body).toMatchObject(updatedData);
        });
      });
  });
});