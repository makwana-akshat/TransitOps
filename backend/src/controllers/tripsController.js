
// Placeholder Controller for trips

const getAll = async (req, res, next) => {
  try {
    res.json({ message: 'GET all trips successful', data: [] });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    res.json({ message: 'GET trips by ID successful', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    res.status(201).json({ message: 'POST trips successful', data: req.body });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    res.json({ message: 'PUT trips successful', id: req.params.id, data: req.body });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    res.json({ message: 'DELETE trips successful', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
