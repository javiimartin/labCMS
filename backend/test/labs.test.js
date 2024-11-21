const { createLab, updateLab, deleteLab } = require('./labs.controller');
const pool = require('../db');

// Mock del pool de base de datos
jest.mock('../db', () => ({
  query: jest.fn(),
}));

describe('Labs Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createLab', () => {
    it('debería crear un laboratorio y devolver su código', async () => {
      const req = {
        body: {
          lab_name: 'Test Lab',
          lab_description: 'Description',
          lab_objectives: 'Objectives',
          lab_proyects: 'Projects',
        },
        files: null,
      };
      const res = {
        json: jest.fn(),
      };
      const next = jest.fn();

      // Mock para la inserción en la base de datos
      pool.query.mockResolvedValueOnce({
        rows: [{ lab_code: 1 }],
      });

      await createLab(req, res, next);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO lab'),
        expect.arrayContaining(['Test Lab', 'Description', 'Objectives', 'Projects', '', '', ''])
      );
      expect(res.json).toHaveBeenCalledWith({ lab_code: 1 });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería manejar errores al crear un laboratorio', async () => {
      const req = { body: {}, files: null };
      const res = { json: jest.fn() };
      const next = jest.fn();

      pool.query.mockRejectedValueOnce(new Error('Database error'));

      await createLab(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('updateLab', () => {
    it('debería actualizar un laboratorio existente', async () => {
      const req = {
        params: { id: 1 },
        body: {
          lab_name: 'Updated Lab',
          lab_description: 'Updated Description',
          lab_objectives: 'Updated Objectives',
          lab_proyects: 'Updated Projects',
        },
        files: null,
      };
      const res = {
        json: jest.fn(),
      };
      const next = jest.fn();

      pool.query
        .mockResolvedValueOnce({
          rows: [{ lab_images: '', lab_video: '', lab_podcast: '' }],
        }) // Recuperar multimedia existente
        .mockResolvedValueOnce({
          rows: [{ lab_code: 1 }],
        }); // Actualización del laboratorio

      await updateLab(req, res, next);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE lab'),
        expect.arrayContaining(['Updated Lab', 'Updated Description', 'Updated Objectives', 'Updated Projects', '', '', '', 1])
      );
      expect(res.json).toHaveBeenCalledWith({ lab_code: 1 });
      expect(next).not.toHaveBeenCalled();
    });

    it('debería devolver 404 si el laboratorio no existe', async () => {
      const req = { params: { id: 999 }, body: {}, files: null };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      const next = jest.fn();

      pool.query.mockResolvedValueOnce({ rows: [] });

      await updateLab(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Lab not found' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('deleteLab', () => {
    it('debería eliminar un laboratorio existente', async () => {
      const req = { params: { id: 1 } };
      const res = { sendStatus: jest.fn() };
      const next = jest.fn();

      pool.query
        .mockResolvedValueOnce({
          rows: [{ lab_images: '', lab_video: '', lab_podcast: '' }],
        }) // Recuperar multimedia existente
        .mockResolvedValueOnce({ rowCount: 1 }); // Eliminación del laboratorio

      await deleteLab(req, res, next);

      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM lab'), [1]);
      expect(res.sendStatus).toHaveBeenCalledWith(204);
      expect(next).not.toHaveBeenCalled();
    });

    it('debería devolver 404 si el laboratorio no existe', async () => {
      const req = { params: { id: 999 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      pool.query.mockResolvedValueOnce({ rows: [] });

      await deleteLab(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Lab not found' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
