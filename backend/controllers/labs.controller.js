const {
  createLab,
  updateLab,
  getAllLabs,
  getLabById,
  deleteLab,
} = require('../services/lab.service');
const logger = require('../logger');

const createLabHandler = async (req, res, next) => {
  try {
    const timestamp = Date.now();
    const newLab = await createLab(req.body, req.files, timestamp);

    logger.info(`Lab created successfully with code: ${newLab.lab_code}`);
    res.status(201).json({ lab_code: newLab.lab_code });
  } catch (error) {
    logger.error(`Error in createLabHandler: ${error.message}`);
    next(error);
  }
};

const updateLabHandler = async (req, res, next) => {
  try {
    const timestamp = Date.now();
    const updatedLab = await updateLab(
      req.params.id,
      req.body,
      req.files,
      req.body.imagesToDelete,
      req.body.videoToDelete,
      req.body.audioToDelete,
      timestamp
    );

    logger.info(`Lab updated successfully with code: ${updatedLab.lab_code}`);
    res.json({ lab_code: updatedLab.lab_code });
  } catch (error) {
    logger.error(`Error in updateLabHandler for lab ID ${req.params.id}: ${error.message}`);
    next(error);
  }
};

const getAllLabsHandler = async (req, res, next) => {
  try {
    const labs = await getAllLabs();

    logger.info(`Retrieved all labs. Total count: ${labs.length}`);
    res.json(labs);
  } catch (error) {
    logger.error(`Error in getAllLabsHandler: ${error.message}`);
    next(error);
  }
};

const getLabByIdHandler = async (req, res, next) => {
  try {
    const lab = await getLabById(req.params.id);

    if (!lab) {
      logger.warn(`Lab with ID ${req.params.id} not found`);
      return res.status(404).json({ msg: 'Lab not found' });
    }

    logger.info(`Retrieved lab with ID: ${req.params.id}`);
    res.json(lab);
  } catch (error) {
    logger.error(`Error in getLabByIdHandler for lab ID ${req.params.id}: ${error.message}`);
    next(error);
  }
};

const deleteLabHandler = async (req, res, next) => {
  try {
    await deleteLab(req.params.id);

    logger.info(`Lab deleted successfully with ID: ${req.params.id}`);
    res.sendStatus(204);
  } catch (error) {
    logger.error(`Error in deleteLabHandler for lab ID ${req.params.id}: ${error.message}`);
    next(error);
  }
};

module.exports = {
  createLabHandler,
  updateLabHandler,
  getAllLabsHandler,
  getLabByIdHandler,
  deleteLabHandler,
};
