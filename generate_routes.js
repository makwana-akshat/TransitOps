const fs = require('fs');
const path = require('path');
const routes = ['auth', 'users', 'vehicles', 'drivers', 'trips', 'maintenance', 'fuel', 'expenses', 'dashboard', 'reports'];
const dir = path.join(__dirname, 'backend', 'src', 'routes');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

routes.forEach(route => {
  const template = `const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/clerk');

// Placeholder GET route
router.get('/', requireAuth, (req, res) => {
  res.json({ message: 'GET request to ${route} successful', data: [] });
});

// Placeholder POST route
router.post('/', requireAuth, (req, res) => {
  res.json({ message: 'POST request to ${route} successful', data: req.body });
});

// Placeholder PUT route
router.put('/:id', requireAuth, (req, res) => {
  res.json({ message: 'PUT request to ${route} successful', id: req.params.id, data: req.body });
});

// Placeholder DELETE route
router.delete('/:id', requireAuth, (req, res) => {
  res.json({ message: 'DELETE request to ${route} successful', id: req.params.id });
});

module.exports = router;
`;
  fs.writeFileSync(path.join(dir, `${route}.js`), template);
});
console.log('Routes generated successfully.');
