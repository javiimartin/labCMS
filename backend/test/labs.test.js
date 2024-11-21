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
  
    const deleteLab = async (req, res, next) => {
        const { id } = req.params;
        try {
          // Elimina los registros en la tabla attendance relacionados con el laboratorio
          await pool.query('DELETE FROM attendance WHERE lab_code = $1', [id]);
      
          // Recuperar el laboratorio existente para obtener las referencias a los archivos
          const existingLab = await pool.query('SELECT lab_images, lab_video, lab_podcast FROM lab WHERE lab_code = $1', [id]);
          if (!existingLab.rows || existingLab.rows.length === 0) {
            return res.status(404).json({ message: 'Lab not found' });
          }
      
          const { lab_images, lab_video, lab_podcast } = existingLab.rows[0];
      
          // Eliminar las imágenes del servidor
          if (lab_images) {
            const images = lab_images.split(' - ');
            images.forEach(image => {
              const imagePath = path.join(__dirname, '../data/lab_img', image.split('/').pop());
              if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
              }
            });
          }
      
          // Eliminar el video del servidor
          if (lab_video) {
            const videoPath = path.join(__dirname, '../data/lab_videos', lab_video.split('/').pop());
            if (fs.existsSync(videoPath)) {
              fs.unlinkSync(videoPath);
            }
          }
      
          // Eliminar el podcast del servidor
          if (lab_podcast) {
            const podcastPath = path.join(__dirname, '../data/lab_podcasts', lab_podcast.split('/').pop());
            if (fs.existsSync(podcastPath)) {
              fs.unlinkSync(podcastPath);
            }
          }
      
          // Eliminar el laboratorio de la base de datos
          const result = await pool.query('DELETE FROM lab WHERE lab_code = $1', [id]);
          if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Lab not found' });
          }
      
          res.sendStatus(204);
        } catch (error) {
          console.error('Error in deleteLab:', error);
          next(error);
        }
      };      
  });
  