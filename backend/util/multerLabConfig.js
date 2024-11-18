const multer = require('multer');

// Configuración de multer para almacenar archivos en la memoria (puedes cambiar a almacenamiento en disco si lo prefieres)
const storage = multer.memoryStorage();

// Filtrado de archivos permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'audio/mpeg', 'audio/mp3', 'audio/wav'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, and audio files are allowed.'));
  }
};

// Configuración de multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, 
  },
});

module.exports = upload;