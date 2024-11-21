const {
    getAllLabs,
    getLabById,
    createLab,
    updateLab,
    deleteLab
  } = require('../controllers/labs.controller');
  const pool = require('../db');
  const fs = require('fs');
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
  
        multimediaProcess
          .mockResolvedValueOnce('processed_image1.png')
          .mockResolvedValueOnce('processed_image2.png')
          .mockResolvedValueOnce('processed_video.mp4')
          .mockResolvedValueOnce('processed_podcast.mp3');
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
    });
  
    describe('deleteLab', () => {
        it('debería eliminar un laboratorio y sus archivos relacionados', async () => {
          const req = { params: { id: '1' } };
          const res = { sendStatus: jest.fn() };
          const next = jest.fn();
    
          pool.query
            // Primera llamada: recupera las referencias del laboratorio
            .mockResolvedValueOnce({
              rows: [
                {
                  lab_images: 'image1.png - image2.png',
                  lab_video: 'video.mp4',
                  lab_podcast: 'podcast.mp3'
                }
              ]
            })
            // Segunda llamada: elimina los registros en la tabla `attendance`
            .mockResolvedValueOnce({ rowCount: 1 })
            // Tercera llamada: elimina los registros en la tabla `lab_followers`
            .mockResolvedValueOnce({ rowCount: 1 })
            // Cuarta llamada: elimina el laboratorio de la base de datos
            .mockResolvedValueOnce({ rowCount: 1 });
    
          fs.existsSync.mockReturnValue(true);
          fs.unlinkSync.mockImplementation(() => {});
    
          await deleteLab(req, res, next);
    
          // Verifica las llamadas a la base de datos
          expect(pool.query).toHaveBeenCalledTimes(4);
          // Verifica la eliminación de los archivos
          expect(fs.unlinkSync).toHaveBeenCalledTimes(3);
          // Verifica la respuesta enviada
          expect(res.sendStatus).toHaveBeenCalledWith(204);
        });
      });
  });
  