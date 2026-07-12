const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/clerk');

// Placeholder GET route
router.get('/', requireAuth, (req, res) => {
  res.json({ message: 'GET request to fuel successful', data: [] });
});

// Placeholder POST route
router.post('/', requireAuth, (req, res) => {
  res.json({ message: 'POST request to fuel successful', data: req.body });
});

// Placeholder PUT route
router.put('/:id', requireAuth, (req, res) => {
  res.json({ message: 'PUT request to fuel successful', id: req.params.id, data: req.body });
});

// Placeholder DELETE route
router.delete('/:id', requireAuth, (req, res) => {
  res.json({ message: 'DELETE request to fuel successful', id: req.params.id });
});

module.exports = router;
