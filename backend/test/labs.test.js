const request = require('supertest');
const express = require('express');
const { createLab, updateLab, deleteLab } = require('./labs.controller');
const pool = require('../db');

// Mock del pool de base de datos
jest.mock('../db', () => ({
  query: jest.fn(),
}));

// Configuración de la aplicación express simulada
const app = express();
app.use(express.json());
app.post('/labs', createLab);
app.put('/labs/:id', updateLab);
app.delete('/labs/:id', deleteLab);

describe('Labs Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /labs - createLab', () => {
    it('debería crear un laboratorio y devolver su código', async () => {
      // Mock para insertar un laboratorio
      pool.query.mockResolvedValueOnce({
        rows: [{ lab_code: 1, lab_name: 'Test Lab' }],
      });

      const response = await request(app)
        .post('/labs')
        .send({
          lab_name: 'Test Lab',
          lab_description: 'Description',
          lab_objectives: 'Objectives',
          lab_proyects: 'Projects',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ lab_code: 1 });
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO lab'),
        expect.arrayContaining(['Test Lab', 'Description', 'Objectives', 'Projects'])
      );
    });

    it('debería manejar errores al crear un laboratorio', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .post('/labs')
        .send({
          lab_name: 'Test Lab',
          lab_description: 'Description',
          lab_objectives: 'Objectives',
          lab_proyects: 'Projects',
        });

      expect(response.status).toBe(500);
    });
  });

  describe('PUT /labs/:id - updateLab', () => {
    it('debería actualizar un laboratorio existente', async () => {
      // Mock para seleccionar y actualizar un laboratorio
      pool.query
        .mockResolvedValueOnce({
          rows: [{ lab_images: '', lab_video: '', lab_podcast: '' }],
        }) // Consulta para obtener datos existentes
        .mockResolvedValueOnce({
          rows: [{ lab_code: 1 }],
        }); // Actualización del laboratorio

      const response = await request(app)
        .put('/labs/1')
        .send({
          lab_name: 'Updated Lab',
          lab_description: 'Updated Description',
          lab_objectives: 'Updated Objectives',
          lab_proyects: 'Updated Projects',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ lab_code: 1 });
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE lab'),
        expect.arrayContaining(['Updated Lab', 'Updated Description', 'Updated Objectives', 'Updated Projects', 1])
      );
    });

    it('debería devolver 404 si el laboratorio no existe', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .put('/labs/999')
        .send({
          lab_name: 'Updated Lab',
          lab_description: 'Updated Description',
          lab_objectives: 'Updated Objectives',
          lab_proyects: 'Updated Projects',
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Lab not found' });
    });
  });

  describe('DELETE /labs/:id - deleteLab', () => {
    it('debería eliminar un laboratorio existente', async () => {
      // Mock para obtener datos existentes y eliminar
      pool.query
        .mockResolvedValueOnce({
          rows: [{ lab_images: '', lab_video: '', lab_podcast: '' }],
        }) // Consulta para obtener datos existentes
        .mockResolvedValueOnce({ rowCount: 1 }); // Eliminación del laboratorio

      const response = await request(app).delete('/labs/1');

      expect(response.status).toBe(204);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM lab'), [1]);
    });

    it('debería devolver 404 si el laboratorio no existe', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).delete('/labs/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Lab not found' });
    });
  });
});
