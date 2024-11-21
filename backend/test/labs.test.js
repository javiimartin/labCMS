const {
    createLab,
    updateLab,
    deleteLab,
  } = require('../controllers/labs.controller');
  const pool = require('../db');
  const fs = require('fs');
  const multimediaProcess = require('../util/multimediaProcess');
  
  jest.mock('../db', () => ({
    query: jest.fn(),
  }));
  jest.mock('fs');
  jest.mock('../util/multimediaProcess', () => jest.fn());
  
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
            lab_images: [{ filename: 'image1.png' }, { filename: 'image2.png' }],
            lab_video: [{ filename: 'video.mp4' }],
            lab_podcast: [{ filename: 'podcast.mp3' }],
          },
        };
        const res = { json: jest.fn() };
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
        expect(res.json).toHaveBeenCalledWith({ lab_code: 1 });
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
            lab_images: [{ filename: 'new_image.png' }],
            lab_video: [{ filename: 'new_video.mp4' }],
          },
        };
        const res = { json: jest.fn() };
        const next = jest.fn();
  
        fs.existsSync.mockReturnValue(true);
        fs.unlinkSync.mockImplementation(() => {});
  
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
    });
  
    describe('deleteLab', () => {
      it('debería eliminar un laboratorio y sus archivos relacionados', async () => {
        const req = { params: { id: '1' } };
        const res = { sendStatus: jest.fn() };
        const next = jest.fn();
  
        fs.existsSync.mockReturnValue(true);
        fs.unlinkSync.mockImplementation(() => {});
  
        pool.query
          .mockResolvedValueOnce({
            rows: [
              {
                lab_images: 'image1.png - image2.png',
                lab_video: 'video.mp4',
                lab_podcast: 'podcast.mp3',
              },
            ],
          })
          .mockResolvedValueOnce({ rowCount: 1 });
  
        await deleteLab(req, res, next);
  
        expect(pool.query).toHaveBeenCalledTimes(2);
        expect(fs.unlinkSync).toHaveBeenCalledTimes(3);
        expect(res.sendStatus).toHaveBeenCalledWith(204);
      });
    });
  });
  