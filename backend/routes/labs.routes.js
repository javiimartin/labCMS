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
  getLabFollowersCount,
} = require('../controllers/labs.controller');

// Configuración de multer
const upload = require('../util/multerLabConfig');

function multerErrorHandling(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(500).json({ error: 'An unknown error occurred during file upload.' });
  }
  next();
}

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Labs
 *   description: Gestión de laboratorios
 */

/**
 * @swagger
 * /labs:
 *   get:
 *     summary: Obtener todos los laboratorios
 *     tags: [Labs]
 *     responses:
 *       200:
 *         description: Lista de laboratorios obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   lab_code:
 *                     type: string
 *                     description: Código único del laboratorio.
 *                   lab_name:
 *                     type: string
 *                     description: Nombre del laboratorio.
 *                   lab_description:
 *                     type: string
 *                     description: Descripción del laboratorio.
 *       500:
 *         description: Error en el servidor.
 */
router.get('/labs', getAllLabs);

/**
 * @swagger
 * /labs/{id}:
 *   get:
 *     summary: Obtener un laboratorio por ID
 *     tags: [Labs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del laboratorio.
 *     responses:
 *       200:
 *         description: Detalles del laboratorio.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lab_code:
 *                   type: string
 *                 lab_name:
 *                   type: string
 *                 lab_description:
 *                   type: string
 *       404:
 *         description: Laboratorio no encontrado.
 *       500:
 *         description: Error en el servidor.
 */
router.get('/labs/:id', getLabById);

/**
 * @swagger
 * /labs:
 *   post:
 *     summary: Crear un nuevo laboratorio
 *     tags: [Labs]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - lab_name
 *               - lab_description
 *               - lab_objectives
 *               - lab_proyects
 *             properties:
 *               lab_name:
 *                 type: string
 *                 description: Nombre del laboratorio.
 *               lab_description:
 *                 type: string
 *                 description: Descripción del laboratorio.
 *               lab_objectives:
 *                 type: string
 *                 description: Objetivos del laboratorio. (Obligatorio)
 *               lab_proyects:
 *                 type: string
 *                 description: Proyectos del laboratorio. (Obligatorio)
 *               lab_images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Imágenes del laboratorio.
 *               lab_video:
 *                 type: string
 *                 format: binary
 *                 description: Video del laboratorio.
 *               lab_podcast:
 *                 type: string
 *                 format: binary
 *                 description: Podcast del laboratorio.
 *     responses:
 *       201:
 *         description: Laboratorio creado exitosamente.
 *       400:
 *         description: Error en los datos de entrada.
 *       500:
 *         description: Error en el servidor.
 */
router.post(
  '/labs',
  (req, res, next) => {
    upload.fields([
      { name: 'lab_images', maxCount: 10 },
      { name: 'lab_video', maxCount: 1 },
      { name: 'lab_podcast', maxCount: 1 },
    ])(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(500).json({ error: 'Error al procesar archivos.' });
      }
      next();
    });
  },
  createLab
);


/**
 * @swagger
 * /labs/{id}:
 *   put:
 *     summary: Actualizar un laboratorio existente
 *     tags: [Labs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del laboratorio.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - lab_name
 *               - lab_description
 *               - lab_objectives
 *               - lab_proyects
 *             properties:
 *               lab_name:
 *                 type: string
 *                 description: Nombre actualizado del laboratorio.
 *               lab_description:
 *                 type: string
 *                 description: Descripción actualizada del laboratorio.
 *               lab_objectives:
 *                 type: string
 *                 description: Objetivos actualizados del laboratorio. (Obligatorio)
 *               lab_proyects:
 *                 type: string
 *                 description: Proyectos actualizados del laboratorio. (Obligatorio)
 *               lab_images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Imágenes actualizadas del laboratorio.
 *               lab_video:
 *                 type: string
 *                 format: binary
 *                 description: Video actualizado del laboratorio.
 *               lab_podcast:
 *                 type: string
 *                 format: binary
 *                 description: Podcast actualizado del laboratorio.
 *     responses:
 *       200:
 *         description: Laboratorio actualizado exitosamente.
 *       400:
 *         description: Error en los datos de entrada.
 *       404:
 *         description: Laboratorio no encontrado.
 *       500:
 *         description: Error en el servidor.
 */

router.put(
  '/labs/:id',
  (req, res, next) => {
    upload.fields([
      { name: 'lab_images', maxCount: 10 },
      { name: 'lab_video', maxCount: 1 },
      { name: 'lab_podcast', maxCount: 1 },
    ])(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(500).json({ error: 'Error al procesar archivos.' });
      }
      next();
    });
  },
  updateLab
);


/**
 * @swagger
 * /labs/{id}:
 *   delete:
 *     summary: Eliminar un laboratorio por ID
 *     tags: [Labs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del laboratorio a eliminar.
 *     responses:
 *       204:
 *         description: Laboratorio eliminado exitosamente.
 *       404:
 *         description: Laboratorio no encontrado.
 *       500:
 *         description: Error en el servidor.
 */
router.delete('/labs/:id', deleteLab);


module.exports = router;
