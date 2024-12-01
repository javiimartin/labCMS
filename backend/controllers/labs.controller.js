const {
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
} = require('../services/labs.service');

const getAllLabs = async (req, res, next) => {
  try {
    const labs = await getAllLabsService();
    res.json(labs);
  } catch (error) {
    next(error);
  }
};

const getLabById = async (req, res, next) => {
  try {
    const lab = await getLabByIdService(req.params.id);
    res.json(lab);
  } catch (error) {
    next(error);
  }
};

const createLab = async (req, res, next) => {
  try {
    const lab = await createLabService(req.body, req.files);
    res.status(201).json(lab);
  } catch (error) {
    next(error);
  }
};

const updateLab = async (req, res, next) => {
  try {
    const updatedLab = await updateLabService(req.params.id, req.body, req.files);
    res.json(updatedLab);
  } catch (error) {
    next(error);
  }
};

const deleteLab = async (req, res, next) => {
  try {
    await deleteLabService(req.params.id);
    res.sendStatus(204);
  } catch (error) {
    if (error.message === 'Lab not found') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

const deleteLabImage = async (req, res, next) => {
  try {
    const updatedLab = await deleteLabImageService(req.params.id, req.body.image);
    res.json(updatedLab);
  } catch (error) {
    next(error);
  }
};

const deleteLabMedia = async (req, res, next) => {
  try {
    const updatedLab = await deleteLabMediaService(req.params.id, req.body.mediaType, req.body.mediaUrl);
    res.json(updatedLab);
  } catch (error) {
    next(error);
  }
};

const followLab = async (req, res, next) => {
  try {
    await followLabService(req.params.id, req.user.user_id);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

const unfollowLab = async (req, res, next) => {
  try {
    await unfollowLabService(req.params.id, req.user.user_id);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

const checkIfFollowing = async (req, res, next) => {
  try {
    const isFollowing = await checkIfFollowingService(req.params.id, req.params.userId);
    res.json({ isFollowing });
  } catch (error) {
    next(error);
  }
};

const getLabFollowersCount = async (req, res, next) => {
  try {
    const count = await getLabFollowersCountService(req.params.id);
    res.json({ count });
  } catch (error) {
    next(error);
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
  getLabFollowersCount,
};
