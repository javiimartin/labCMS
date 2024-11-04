const fs = require('fs');
const path = require('path');
const pool = require('../db');
const multimediaProcess = require('../util/multimediaProcess');
const QRCode = require('qrcode');

const BASE_URL = 'https://localhost:5000/static/lab_img/';
const BASE_VIDEO_URL = 'https://localhost:5000/static/lab_videos/';
const BASE_PODCAST_URL = 'https://localhost:5000/static/lab_podcasts/';

const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    try {
      console.log(`Creating directory: ${dirname}`);
      fs.mkdirSync(dirname, { recursive: true });
      fs.chmodSync(dirname, 0o755); 
    } catch (error) {
      console.error(`Error creating directory ${dirname}:`, error);
    }
  }
};

const createLab = async (req, res, next) => {
  const { lab_name, lab_description, lab_objectives, lab_proyects } = req.body;
  let lab_images = [];
  let lab_video = '';
  let lab_podcast = '';

  const timestamp = Date.now();

  try {
    if (req.files && req.files.lab_images) {
      const imageNames = await Promise.all(req.files.lab_images.map(file =>
        multimediaProcess(file, 'image', timestamp)
      ));
      lab_images = imageNames;
    }

    if (req.files && req.files.lab_video) {
      lab_video = await multimediaProcess(req.files.lab_video[0], 'video', timestamp);
    }

    if (req.files && req.files.lab_podcast) {
      lab_podcast = await multimediaProcess(req.files.lab_podcast[0], 'podcast', timestamp);
    }

    const result = await pool.query(
      'INSERT INTO lab (lab_name, lab_description, lab_objectives, lab_proyects, lab_images, lab_video, lab_podcast) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING lab_code, lab_name',
      [lab_name, lab_description, lab_objectives, lab_proyects, lab_images.join(' - '), lab_video, lab_podcast]
    );

    const newLab = result.rows[0];
    console.log('New Lab created:', newLab);

    // Verificar que el lab_code está definido correctamente
    if (!newLab.lab_code) {
      throw new Error('Lab code is undefined. Cannot generate QR code.');
    }

    const qrValue = `${newLab.lab_code} - ${newLab.lab_name}`;
    const qrPath = path.join(__dirname, `../data/lab_qr/${newLab.lab_code}.png`);
    console.log("QR Path:", qrPath);  // Depuración: Asegúrate de que el path sea correcto
    ensureDirectoryExistence(qrPath);

    await QRCode.toFile(qrPath, qrValue);

    // Verificar que el archivo ha sido creado
    if (!fs.existsSync(qrPath)) {
        throw new Error('QR code file was not created.');
    }
    
    res.json({ lab_code: newLab.lab_code });
    
  } catch (error) {
    console.error('Error in createLab:', error);
    next(error);
  }
};

const updateLab = async (req, res, next) => {
  const { id } = req.params;
  const { lab_name, lab_description, lab_objectives, lab_proyects, videoToDelete, audioToDelete } = req.body;
  let lab_images = [];
  let lab_video = '';
  let lab_podcast = '';

  const timestamp = Date.now(); // Generar el prefijo basado en la fecha y hora actual

  try {
    // Recuperar multimedia existente
    const existingLab = await pool.query('SELECT lab_images, lab_video, lab_podcast FROM lab WHERE lab_code = $1', [id]);
    if (existingLab.rows.length > 0) {
      lab_images = existingLab.rows[0].lab_images.split(' - ').filter(img => img.trim() !== '');
      lab_video = existingLab.rows[0].lab_video;
      lab_podcast = existingLab.rows[0].lab_podcast;
    }

    // Eliminar imágenes marcadas para eliminación
    if (req.body.imagesToDelete) {
      const imagesToDelete = Array.isArray(req.body.imagesToDelete) ? req.body.imagesToDelete : [req.body.imagesToDelete];

      imagesToDelete.forEach(image => {
        const index = lab_images.indexOf(image);
        if (index > -1) {
          lab_images.splice(index, 1); // Eliminar de la lista
          const imagePath = path.join(__dirname, '../data/lab_img', image.split('/').pop());
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath); // Eliminar del servidor
          }
        }
      });
    }

    // Eliminar video si está marcado para eliminación
    if (videoToDelete && lab_video) {
      const videoPath = path.join(__dirname, '../data/lab_videos', lab_video.split('/').pop());
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath); // Eliminar del servidor
      }
      lab_video = ''; // Eliminar la referencia en la base de datos
    }

    // Eliminar podcast si está marcado para eliminación
    if (audioToDelete && lab_podcast) {
      const podcastPath = path.join(__dirname, '../data/lab_podcasts', lab_podcast.split('/').pop());
      if (fs.existsSync(podcastPath)) {
        fs.unlinkSync(podcastPath); // Eliminar del servidor
      }
      lab_podcast = ''; // Eliminar la referencia en la base de datos
    }

    // Procesar nuevas imágenes
    if (req.files && req.files.lab_images) {
      const imageNames = await Promise.all(req.files.lab_images.map(file =>
        multimediaProcess(file, 'image', timestamp)
      ));
      lab_images = [...lab_images, ...imageNames];
    }

    // Procesar nuevo video
    if (req.files && req.files.lab_video) {
      lab_video = await multimediaProcess(req.files.lab_video[0], 'video', timestamp);
    }

    // Procesar nuevo podcast
    if (req.files && req.files.lab_podcast) {
      lab_podcast = await multimediaProcess(req.files.lab_podcast[0], 'podcast', timestamp);
    }

    // Actualizar base de datos
    const result = await pool.query(
      'UPDATE lab SET lab_name = $1, lab_description = $2, lab_objectives = $3, lab_proyects = $4, lab_images = $5, lab_video = $6, lab_podcast = $7 WHERE lab_code = $8 RETURNING lab_code',
      [lab_name, lab_description, lab_objectives, lab_proyects, lab_images.join(' - '), lab_video, lab_podcast, id]
    );

    console.log('Updated Lab:', result.rows[0]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    res.json({ lab_code: result.rows[0].lab_code });
  } catch (error) {
    console.error('Error in updateLab:', error);
    next(error);
  }
};

const deleteLabImage = async (req, res, next) => {
  const { id } = req.params;
  const { image } = req.body;
  try {
    const existingLab = await pool.query('SELECT lab_images FROM lab WHERE lab_code = $1', [id]);
    if (existingLab.rows.length === 0) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    const lab_images = existingLab.rows[0].lab_images.split(' - ').filter(img => img !== image).join(' - ');
    const result = await pool.query(
      'UPDATE lab SET lab_images = $1 WHERE lab_code = $2 RETURNING *',
      [lab_images, id]
    );

    const imagePath = path.join(__dirname, '../data/lab_img', image.split('/').pop());
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const getAllLabs = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM lab');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const getLabById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM lab WHERE lab_code = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Lab not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const deleteLab = async (req, res, next) => {
  const { id } = req.params;
  try {
    // Primero, elimina los registros en la tabla attendance relacionados con el laboratorio
    await pool.query('DELETE FROM attendance WHERE lab_code = $1', [id]);

    // Elimina los seguidores relacionados con el laboratorio
    await pool.query('DELETE FROM lab_followers WHERE lab_code = $1', [id]);

    // Recuperar el laboratorio existente para obtener las referencias a los archivos
    const existingLab = await pool.query('SELECT lab_images, lab_video, lab_podcast FROM lab WHERE lab_code = $1', [id]);
    if (existingLab.rows.length === 0) {
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

const deleteLabMedia = async (req, res, next) => {
  const { id } = req.params;
  const { mediaType, mediaUrl } = req.body;

  try {
    let updateQuery = '';
    let filePath = '';

    if (mediaType === 'image') {
      const existingLab = await pool.query('SELECT lab_images FROM lab WHERE lab_code = $1', [id]);
      if (existingLab.rows.length === 0) {
        return res.status(404).json({ message: 'Lab not found' });
      }
      const lab_images = existingLab.rows[0].lab_images.split(' - ').filter(img => img !== mediaUrl).join(' - ');
      updateQuery = 'UPDATE lab SET lab_images = $1 WHERE lab_code = $2 RETURNING *';
      filePath = path.join(__dirname, '../data/lab_img', mediaUrl.split('/').pop());
    } else if (mediaType === 'video') {
      updateQuery = 'UPDATE lab SET lab_video = NULL WHERE lab_code = $1 RETURNING *';
      filePath = path.join(__dirname, '../data/lab_videos', mediaUrl.split('/').pop());
    } else if (mediaType === 'podcast') {
      updateQuery = 'UPDATE lab SET lab_podcast = NULL WHERE lab_code = $1 RETURNING *';
      filePath = path.join(__dirname, '../data/lab_podcasts', mediaUrl.split('/').pop());
    } else {
      return res.status(400).json({ message: 'Invalid media type' });
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const result = await pool.query(updateQuery, [mediaType === 'image' ? lab_images : id, id]);
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

const followLab = async (req, res, next) => {
  const { id } = req.params;
  const { user_code } = req.body;

  try {
    await pool.query('INSERT INTO lab_followers (lab_code, user_code) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, user_code]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

const unfollowLab = async (req, res, next) => {
  const { id } = req.params; // lab_code
  const { user_code } = req.body;

  try {
    await pool.query('DELETE FROM lab_followers WHERE lab_code = $1 AND user_code = $2', [id, user_code]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

const checkIfFollowing = async (req, res, next) => {
  const { id, userId } = req.params;

  // Asegurarse de que id y userId son enteros válidos
  const labId = parseInt(id, 10);
  const userCode = parseInt(userId, 10);

  if (isNaN(labId) || isNaN(userCode)) {
    return res.status(400).json({ error: 'Invalid lab ID or user ID' });
  }

  try {
    const result = await pool.query(
      'SELECT 1 FROM lab_followers WHERE lab_code = $1 AND user_code = $2',
      [labId, userCode]
    );
    res.json({ isFollowing: result.rows.length > 0 });
  } catch (error) {
    next(error);
  }

};

const getLabFollowersCount = async (req, res) => {
  const labId = parseInt(req.params.id, 10);
  
  // Verificar si labId es un número válido
  if (isNaN(labId)) {
    return res.status(400).json({ error: 'Invalid Lab ID' });
  }

  try {
    const result = await pool.query('SELECT COUNT(*) FROM lab_followers WHERE lab_code = $1', [labId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lab not found' });
    }

    const followersCount = result.rows[0].count;
    return res.json({ count: parseInt(followersCount, 10) });
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching followers count' });
  }
};

module.exports = {
  getAllLabs,
  getLabById,
  createLab,
  updateLab,
  deleteLab,
  deleteLabImage,
  deleteLabMedia,
  followLab,
  unfollowLab,
  checkIfFollowing,
  getLabFollowersCount
};