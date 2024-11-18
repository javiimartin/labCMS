const fs = require('fs');
const path = require('path');

const multimediaProcess = async (file, type, timestamp) => {
  let uploadDir;
  let baseUrl;

  switch (type) {
    case 'image':
      uploadDir = path.join(__dirname, '../data/lab_img');
      baseUrl = 'https://localhost:5000/static/lab_img/';
      break;
    case 'video':
      uploadDir = path.join(__dirname, '../data/lab_videos');
      baseUrl = 'https://localhost:5000/static/lab_videos/';
      break;
    case 'podcast':
      uploadDir = path.join(__dirname, '../data/lab_podcasts');
      baseUrl = 'https://localhost:5000/static/lab_podcasts/';
      break;
    default:
      throw new Error('Invalid media type');
  }

  // Verifica si el directorio existe, si no, lo crea
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Directory created: ${uploadDir}`);
  }

  const formattedName = file.originalname.split(' ').join('-');
  const fileName = `${timestamp}-${formattedName}`;
  const filePath = path.join(uploadDir, fileName);

  try {
    // Guarda el archivo en el sistema de archivos
    fs.writeFileSync(filePath, file.buffer);
    console.log(`${type.charAt(0).toUpperCase() + type.slice(1)} processed and saved as: ${fileName}`);
  } catch (error) {
    console.log(`Error while processing ${type}`, error);
    throw error;
  }

  return `${baseUrl}${fileName}`;
};

module.exports = multimediaProcess;