const fs = require('fs');
const path = require('path');
const pool = require('../db');
const multimediaProcess = require('../util/multimediaProcess');

const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
    fs.chmodSync(dirname, 0o755);
  }
};

const createLab = async (labData, files, timestamp) => {
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
    [
      labData.lab_name,
      labData.lab_description,
      labData.lab_objectives,
      labData.lab_proyects,
      lab_images.join(' - '),
      lab_video,
      lab_podcast,
    ]
  );

  return result.rows[0];
};

const updateLab = async (id, labData, files, imagesToDelete, videoToDelete, audioToDelete, timestamp) => {
  const existingLab = await pool.query(
    'SELECT lab_images, lab_video, lab_podcast FROM lab WHERE lab_code = $1',
    [id]
  );

  if (existingLab.rows.length === 0) {
    throw new Error('Lab not found');
  }

  let lab_images = existingLab.rows[0].lab_images
    ? existingLab.rows[0].lab_images.split(' - ')
    : [];
  let lab_video = existingLab.rows[0].lab_video;
  let lab_podcast = existingLab.rows[0].lab_podcast;

  if (imagesToDelete) {
    imagesToDelete.forEach((image) => {
      const index = lab_images.indexOf(image);
      if (index > -1) {
        lab_images.splice(index, 1);
        const imagePath = path.join(__dirname, '../data/lab_img', image.split('/').pop());
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
    });
  }

  if (videoToDelete && lab_video) {
    const videoPath = path.join(__dirname, '../data/lab_videos', lab_video.split('/').pop());
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }
    lab_video = '';
  }

  if (audioToDelete && lab_podcast) {
    const podcastPath = path.join(__dirname, '../data/lab_podcasts', lab_podcast.split('/').pop());
    if (fs.existsSync(podcastPath)) {
      fs.unlinkSync(podcastPath);
    }
    lab_podcast = '';
  }

  if (files && files.lab_images) {
    const newImages = await Promise.all(
      files.lab_images.map((file) => multimediaProcess(file, 'image', timestamp))
    );
    lab_images = [...lab_images, ...newImages];
  }

  if (files && files.lab_video) {
    lab_video = await multimediaProcess(files.lab_video[0], 'video', timestamp);
  }

  if (files && files.lab_podcast) {
    lab_podcast = await multimediaProcess(files.lab_podcast[0], 'podcast', timestamp);
  }

  const result = await pool.query(
    'UPDATE lab SET lab_name = $1, lab_description = $2, lab_objectives = $3, lab_proyects = $4, lab_images = $5, lab_video = $6, lab_podcast = $7 WHERE lab_code = $8 RETURNING lab_code',
    [
      labData.lab_name,
      labData.lab_description,
      labData.lab_objectives,
      labData.lab_proyects,
      lab_images.join(' - '),
      lab_video,
      lab_podcast,
      id,
    ]
  );

  return result.rows[0];
};

const getAllLabs = async () => {
  const result = await pool.query('SELECT * FROM lab');
  return result.rows;
};

const getLabById = async (id) => {
  const result = await pool.query('SELECT * FROM lab WHERE lab_code = $1', [id]);
  if (result.rows.length === 0) {
    throw new Error('Lab not found');
  }
  return result.rows[0];
};

const deleteLab = async (id) => {
  const existingLab = await pool.query('SELECT lab_images, lab_video, lab_podcast FROM lab WHERE lab_code = $1', [id]);

  if (existingLab.rows.length === 0) {
    throw new Error('Lab not found');
  }

  const { lab_images, lab_video, lab_podcast } = existingLab.rows[0];

  if (lab_images) {
    lab_images.split(' - ').forEach((image) => {
      const imagePath = path.join(__dirname, '../data/lab_img', image.split('/').pop());
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });
  }

  if (lab_video) {
    const videoPath = path.join(__dirname, '../data/lab_videos', lab_video.split('/').pop());
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }
  }

  if (lab_podcast) {
    const podcastPath = path.join(__dirname, '../data/lab_podcasts', lab_podcast.split('/').pop());
    if (fs.existsSync(podcastPath)) {
      fs.unlinkSync(podcastPath);
    }
  }

  await pool.query('DELETE FROM lab WHERE lab_code = $1', [id]);
};

module.exports = {
  ensureDirectoryExistence,
  createLab,
  updateLab,
  getAllLabs,
  getLabById,
  deleteLab,
};
