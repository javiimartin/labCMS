const fs = require('fs');
const path = require('path');
const pool = require('../db');
const multimediaProcess = require('../util/multimediaProcess');

const getAllLabsService = async () => {
  const result = await pool.query('SELECT * FROM lab');
  return result.rows;
};

const getLabByIdService = async (id) => {
  const result = await pool.query('SELECT * FROM lab WHERE lab_code = $1', [id]);
  if (result.rows.length === 0) {
    throw new Error('Lab not found');
  }
  return result.rows[0];
};

const createLabService = async (labData, files) => {
  const { lab_name, lab_description, lab_objectives, lab_proyects } = labData;
  const timestamp = Date.now();
  let lab_images = [];
  let lab_video = '';
  let lab_podcast = '';

  if (files && files.lab_images) {
    lab_images = await Promise.all(
      files.lab_images.map((file) => multimediaProcess(file, 'image', timestamp))
    );
  }

  if (files && files.lab_video) {
    lab_video = await multimediaProcess(files.lab_video[0], 'video', timestamp);
  }

  if (files && files.lab_podcast) {
    lab_podcast = await multimediaProcess(files.lab_podcast[0], 'podcast', timestamp);
  }

  const result = await pool.query(
    'INSERT INTO lab (lab_name, lab_description, lab_objectives, lab_proyects, lab_images, lab_video, lab_podcast) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING lab_code, lab_name',
    [lab_name, lab_description, lab_objectives, lab_proyects, lab_images.join(' - '), lab_video, lab_podcast]
  );

  return result.rows[0];
};

const updateLabService = async (id, labData, files) => {
  const { lab_name, lab_description, lab_objectives, lab_proyects, imagesToDelete = [] } = labData;
  const timestamp = Date.now();

  const existingLab = await pool.query('SELECT * FROM lab WHERE lab_code = $1', [id]);
  if (existingLab.rows.length === 0) {
    throw new Error('Lab not found');
  }

  let lab_images = existingLab.rows[0].lab_images.split(' - ').filter((img) => img.trim() !== '');
  let lab_video = existingLab.rows[0].lab_video;
  let lab_podcast = existingLab.rows[0].lab_podcast;

  // Eliminar imágenes especificadas
  imagesToDelete.forEach((image) => {
    const filePath = path.join(__dirname, '..', 'uploads', image);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    lab_images = lab_images.filter((img) => img !== image);
  });

  // Procesar nuevas imágenes, video y podcast
  if (files && files.lab_images) {
    const newImages = await Promise.all(files.lab_images.map((file) => multimediaProcess(file, 'image', timestamp)));
    lab_images = [...lab_images, ...newImages];
  }

  if (files && files.lab_video) {
    lab_video = await multimediaProcess(files.lab_video[0], 'video', timestamp);
  }

  if (files && files.lab_podcast) {
    lab_podcast = await multimediaProcess(files.lab_podcast[0], 'podcast', timestamp);
  }

  const result = await pool.query(
    'UPDATE lab SET lab_name = $1, lab_description = $2, lab_objectives = $3, lab_proyects = $4, lab_images = $5, lab_video = $6, lab_podcast = $7 WHERE lab_code = $8 RETURNING *',
    [lab_name, lab_description, lab_objectives, lab_proyects, lab_images.join(' - '), lab_video, lab_podcast, id]
  );

  return result.rows[0];
};

const deleteLabService = async (id) => {
  const existingLab = await pool.query('SELECT * FROM lab WHERE lab_code = $1', [id]);
  if (existingLab.rows.length === 0) {
    throw new Error('Lab not found');
  }

  const { lab_images, lab_video, lab_podcast } = existingLab.rows[0];

  // Eliminar imágenes asociadas
  if (lab_images) {
    const images = lab_images.split(' - ');
    images.forEach((image) => {
      const filePath = path.join(__dirname, '..', 'uploads', image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  }

  // Eliminar video asociado
  if (lab_video) {
    const videoPath = path.join(__dirname, '..', 'uploads', lab_video);
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }
  }

  // Eliminar podcast asociado
  if (lab_podcast) {
    const podcastPath = path.join(__dirname, '..', 'uploads', lab_podcast);
    if (fs.existsSync(podcastPath)) {
      fs.unlinkSync(podcastPath);
    }
  }

  // Eliminar laboratorio de la base de datos
  await pool.query('DELETE FROM lab WHERE lab_code = $1', [id]);
};


const deleteLabImageService = async (id, image) => {
  const existingLab = await pool.query('SELECT lab_images FROM lab WHERE lab_code = $1', [id]);
  if (existingLab.rows.length === 0) {
    throw new Error('Lab not found');
  }

  const lab_images = existingLab.rows[0].lab_images.split(' - ').filter((img) => img !== image);
  const result = await pool.query('UPDATE lab SET lab_images = $1 WHERE lab_code = $2 RETURNING *', [
    lab_images.join(' - '),
    id,
  ]);

  return result.rows[0];
};

const deleteLabMediaService = async (id, mediaType, mediaUrl) => {
  // Similar logic as `deleteLabImageService` but tailored for video/podcast.
};

const followLabService = async (labId, userId) => {
  await pool.query('INSERT INTO lab_followers (lab_id, user_id) VALUES ($1, $2)', [labId, userId]);
};

const unfollowLabService = async (labId, userId) => {
  await pool.query('DELETE FROM lab_followers WHERE lab_id = $1 AND user_id = $2', [labId, userId]);
};

const checkIfFollowingService = async (labId, userId) => {
  const result = await pool.query('SELECT 1 FROM lab_followers WHERE lab_id = $1 AND user_id = $2', [labId, userId]);
  return result.rows.length > 0;
};

const getLabFollowersCountService = async (labId) => {
  const result = await pool.query('SELECT COUNT(*) AS count FROM lab_followers WHERE lab_id = $1', [labId]);
  return parseInt(result.rows[0].count, 10);
};

module.exports = {
  getAllLabsService,
  getLabByIdService,
  createLabService,
  updateLabService,
  deleteLabService,
  deleteLabImageService,
  deleteLabMediaService,
  followLabService,
  unfollowLabService,
  checkIfFollowingService,
  getLabFollowersCountService,
};
