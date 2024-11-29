const {
  createLab,
  updateLab,
  getAllLabs,
  getLabById,
  deleteLab,
} = require('../services/lab.service');

const createLabHandler = async (req, res, next) => {
  try {
    const timestamp = Date.now();
    const newLab = await createLab(req.body, req.files, timestamp);
    res.status(201).json({ lab_code: newLab.lab_code });
  } catch (error) {
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
    res.json({ lab_code: updatedLab.lab_code });
  } catch (error) {
    next(error);
  }
};

const getAllLabsHandler = async (req, res, next) => {
  try {
    const labs = await getAllLabs();
    res.json(labs);
  } catch (error) {
    next(error);
  }
};

const getLabByIdHandler = async (req, res, next) => {
  try {
    const lab = await getLabById(req.params.id);
    res.json(lab);
  } catch (error) {
    next(error);
  }
};

const deleteLabHandler = async (req, res, next) => {
  try {
    await deleteLab(req.params.id);
    res.sendStatus(204);
  } catch (error) {
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
