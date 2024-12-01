// Mover los mocks al inicio del archivo, antes de cualquier require
jest.mock('../db', () => ({
  query: jest.fn(),
}));
jest.mock('fs');
jest.mock('../util/multimediaProcess', () => jest.fn());

// Ahora importar los módulos necesarios
const {
  createLab,
  updateLab,
  deleteLab,
} = require('../controllers/labs.controller');
const pool = require('../db');
const fs = require('fs');
const multimediaProcess = require('../util/multimediaProcess');

describe('Labs Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createLab', () => {
    it('debería crear un nuevo laboratorio y devolver su código', async () => {
      const req = {
        body: {
          lab_name: 'Test Lab',
          lab_description: 'Test Description',
          lab_objectives: 'Test Objectives',
          lab_proyects: 'Test Projects',
        },
        files: {
          lab_images: [{ originalname: 'image1.png' }, { originalname: 'image2.png' }],
          lab_video: [{ originalname: 'video.mp4' }],
          lab_podcast: [{ originalname: 'podcast.mp3' }],
        },
      };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      const next = jest.fn();

      multimediaProcess
        .mockResolvedValueOnce('processed_image1.png')
        .mockResolvedValueOnce('processed_image2.png')
        .mockResolvedValueOnce('processed_video.mp4')
        .mockResolvedValueOnce('processed_podcast.mp3');

      pool.query.mockResolvedValueOnce({
        rows: [{ lab_code: 1 }],
      });

      await createLab(req, res, next);

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          'Test Lab',
          'Test Description',
          'Test Objectives',
          'Test Projects',
          'processed_image1.png - processed_image2.png',
          'processed_video.mp4',
          'processed_podcast.mp3',
        ])
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ lab_code: 1 });
    });

    it('debería manejar errores y llamar a next()', async () => {
      const req = { body: {}, files: {} };
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
        params: { id: '1' },
        body: {
          lab_name: 'Updated Lab',
          lab_description: 'Updated Description',
          lab_objectives: 'Updated Objectives',
          lab_proyects: 'Updated Projects',
          imagesToDelete: ['image1.png'],
        },
        files: {
          lab_images: [{ originalname: 'new_image.png' }],
          lab_video: [{ originalname: 'new_video.mp4' }],
        },
      };
      const res = { json: jest.fn() };
      const next = jest.fn();

      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync = jest.fn();

      multimediaProcess
        .mockResolvedValueOnce('processed_new_image.png')
        .mockResolvedValueOnce('processed_new_video.mp4');

      pool.query
        .mockResolvedValueOnce({
          rows: [
            { lab_images: 'image1.png - image2.png', lab_video: 'old_video.mp4' },
          ],
        })
        .mockResolvedValueOnce({ rows: [{ lab_code: 1 }] });

      await updateLab(req, res, next);

      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('image1.png'));
      expect(res.json).toHaveBeenCalledWith({ lab_code: 1 });
    });

    it('debería manejar errores y llamar a next()', async () => {
      const req = {
        params: { id: '1' },
        body: { imagesToDelete: ['image1.png'] },
        files: {},
      };
      const res = { json: jest.fn() };
      const next = jest.fn();

      pool.query.mockRejectedValueOnce(new Error('Database error'));

      await updateLab(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('deleteLab', () => {
    it('debería eliminar un laboratorio existente', async () => {
      const req = { params: { id: '1' } };
      const res = { sendStatus: jest.fn() };
      const next = jest.fn();

      pool.query
        .mockResolvedValueOnce({
          rows: [
            {
              lab_images: 'image1.png - image2.png',
              lab_video: 'video.mp4',
              lab_podcast: 'podcast.mp3',
            },
          ],
        }) // Seleccionar laboratorio
        .mockResolvedValueOnce({ rowCount: 1 }); // Eliminar laboratorio

      fs.existsSync.mockReturnValue(true);
      fs.unlinkSync = jest.fn();

      await deleteLab(req, res, next);

      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(fs.unlinkSync).toHaveBeenCalledTimes(3);
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it('debería devolver un error si el laboratorio no existe', async () => {
      const req = { params: { id: '999' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();

      pool.query.mockResolvedValueOnce({ rows: [] });

      await deleteLab(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Lab not found' });
    });

    it('debería manejar errores y llamar a next()', async () => {
      const req = { params: { id: '1' } };
      const res = { sendStatus: jest.fn() };
      const next = jest.fn();

      pool.query.mockRejectedValueOnce(new Error('Database error'));

      await deleteLab(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
