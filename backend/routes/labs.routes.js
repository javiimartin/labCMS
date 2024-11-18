const { Router } = require('express');
const multer = require('multer');
const {
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
} = require('../controllers/labs.controller');

// Configuración de multer (explicada más adelante)
const upload = require('../util/multerLabConfig');

// Middleware para manejar errores de multer
function multerErrorHandling(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(500).json({ error: 'An unknown error occurred during file upload.' });
  }
  next();
}

// Crear el router
const router = Router();

// Rutas
router.get('/labs', getAllLabs);
router.get('/labs/:id', getLabById);

router.post('/labs', 
  upload.fields([
    { name: 'lab_images', maxCount: 10 },
    { name: 'lab_video', maxCount: 1 },
    { name: 'lab_podcast', maxCount: 1 }
  ]), 
  multerErrorHandling, 
  createLab
);

router.put('/labs/:id', 
  upload.fields([
    { name: 'lab_images', maxCount: 10 },
    { name: 'lab_video', maxCount: 1 },
    { name: 'lab_podcast', maxCount: 1 }
  ]), 
  multerErrorHandling, 
  updateLab
);

router.delete('/labs/:id', deleteLab);
router.delete('/labs/:id/images', deleteLabImage);
router.delete('/labs/:id/media', deleteLabMedia);

router.post('/labs/:id/followers', followLab);
router.delete('/labs/:id/followers', unfollowLab);
router.get('/labs/:id/followers/count', getLabFollowersCount);
router.get('/labs/:id/followers/:userId', checkIfFollowing);

module.exports = router;