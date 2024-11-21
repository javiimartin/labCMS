const {
    getAllLabs,
    getLabById,
    createLab,
    updateLab,
    deleteLab
  } = require('../controllers/labs.controller');
  const pool = require('../db');
  const fs = require('fs');
  const path = require('path');
  const multimediaProcess = require('../util/multimediaProcess');
  
  jest.mock('../db', () => ({
    query: jest.fn()
  }));
  jest.mock('../util/multimediaProcess', () => jest.fn());
  jest.mock('fs');
  
  describe('Labs Controller', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    describe('getAllLabs', () => {
      it('debería devolver todos los laboratorios', async () => {
        const req = {};
        const res = { json: jest.fn() };
        const next = jest.fn();
  
        pool.query.mockResolvedValueOnce({ rows: [{ lab_code: 1, lab_name: 'Lab 1' }, { lab_code: 2, lab_name: 'Lab 2' }] });
  
        await getAllLabs(req, res, next);
  
        expect(pool.query).toHaveBeenCalledWith('SELECT * FROM lab');
        expect(res.json).toHaveBeenCalledWith([{ lab_code: 1, lab_name: 'Lab 1' }, { lab_code: 2, lab_name: 'Lab 2' }]);
      });
    });
  
    describe('getLabById', () => {
      it('debería devolver un laboratorio por ID', async () => {
        const req = { params: { id: '1' } };
        const res = { json: jest.fn() };
        const next = jest.fn();
  
        pool.query.mockResolvedValueOnce({ rows: [{ lab_code: 1, lab_name: 'Lab 1' }] });
  
        await getLabById(req, res, next);
  
        expect(pool.query).toHaveBeenCalledWith('SELECT * FROM lab WHERE lab_code = $1', ['1']);
        expect(res.json).toHaveBeenCalledWith({ lab_code: 1, lab_name: 'Lab 1' });
      });
  
      it('debería devolver 404 si el laboratorio no existe', async () => {
        const req = { params: { id: '999' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
  
        pool.query.mockResolvedValueOnce({ rows: [] });
  
        await getLabById(req, res, next);
  
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: 'Lab not found' });
      });
    });
  
    describe('createLab', () => {
      it('debería crear un nuevo laboratorio y devolver su código', async () => {
        const req = {
          body: {
            lab_name: 'New Lab',
            lab_description: 'Description',
            lab_objectives: 'Objectives',
            lab_proyects: 'Projects'
          },
          files: {
            lab_images: [{ filename: 'image1.png' }, { filename: 'image2.png' }],
            lab_video: [{ filename: 'video.mp4' }],
            lab_podcast: [{ filename: 'podcast.mp3' }]
          }
        };
        const res = { json: jest.fn() };
        const next = jest.fn();
  
        multimediaProcess.mockResolvedValueOnce('processed_image1.png');
        multimediaProcess.mockResolvedValueOnce('processed_image2.png');
        multimediaProcess.mockResolvedValueOnce('processed_video.mp4');
        multimediaProcess.mockResolvedValueOnce('processed_podcast.mp3');
        pool.query.mockResolvedValueOnce({ rows: [{ lab_code: 1, lab_name: 'New Lab' }] });
  
        await createLab(req, res, next);
  
        expect(pool.query).toHaveBeenCalledWith(
          'INSERT INTO lab (lab_name, lab_description, lab_objectives, lab_proyects, lab_images, lab_video, lab_podcast) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING lab_code, lab_name',
          [
            'New Lab',
            'Description',
            'Objectives',
            'Projects',
            'processed_image1.png - processed_image2.png',
            'processed_video.mp4',
            'processed_podcast.mp3'
          ]
        );
        expect(res.json).toHaveBeenCalledWith({ lab_code: 1 });
      });
  
      it('debería manejar errores al crear un laboratorio', async () => {
        const req = {
          body: {
            lab_name: 'New Lab',
            lab_description: 'Description',
            lab_objectives: 'Objectives',
            lab_proyects: 'Projects'
          }
        };
        const res = {};
        const next = jest.fn();
  
        pool.query.mockRejectedValueOnce(new Error('Database error'));
  
        await createLab(req, res, next);
  
        expect(next).toHaveBeenCalledWith(new Error('Database error'));
      });
    });
  
    describe('deleteLab', () => {
      it('debería eliminar un laboratorio y sus archivos relacionados', async () => {
        const req = { params: { id: '1' } };
        const res = { sendStatus: jest.fn() };
        const next = jest.fn();
  
        pool.query
          .mockResolvedValueOnce({ rows: [{ lab_images: 'image1.png - image2.png', lab_video: 'video.mp4', lab_podcast: 'podcast.mp3' }] }) // Mock de consulta SELECT
          .mockResolvedValueOnce({ rowCount: 1 }); // Mock de DELETE
  
        fs.existsSync.mockReturnValue(true);
        fs.unlinkSync.mockImplementation(() => {});
  
        await deleteLab(req, res, next);
  
        expect(pool.query).toHaveBeenCalledTimes(3);
        expect(fs.unlinkSync).toHaveBeenCalledTimes(3);
        expect(res.sendStatus).toHaveBeenCalledWith(204);
      });
  
      it('debería manejar errores al eliminar un laboratorio', async () => {
        const req = { params: { id: '1' } };
        const res = {};
        const next = jest.fn();
  
        pool.query.mockRejectedValueOnce(new Error('Database error'));
  
        await deleteLab(req, res, next);
  
        expect(next).toHaveBeenCalledWith(new Error('Database error'));
      });
    });
  });
  