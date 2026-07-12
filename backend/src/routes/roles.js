
const express = require('express');
const router = express.Router();
const { requireAuth, requirePermission } = require('../middleware/clerk');
const controller = require('../controllers/rolesController');

// All routes require auth as a baseline
router.use(requireAuth);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
