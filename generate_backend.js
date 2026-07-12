const fs = require('fs');
const path = require('path');

const resources = [
  'auth', 'users', 'roles', 'vehicles', 'drivers', 
  'trips', 'maintenance', 'fuel', 'expenses', 
  'dashboard', 'reports', 'notifications', 'auditLogs', 'analytics'
];

const controllersDir = path.join(__dirname, 'backend', 'src', 'controllers');
const routesDir = path.join(__dirname, 'backend', 'src', 'routes');

if (!fs.existsSync(controllersDir)) fs.mkdirSync(controllersDir, { recursive: true });
if (!fs.existsSync(routesDir)) fs.mkdirSync(routesDir, { recursive: true });

resources.forEach(resource => {
  // Generate Controller
  const controllerTemplate = `
// Placeholder Controller for ${resource}

const getAll = async (req, res, next) => {
  try {
    res.json({ message: 'GET all ${resource} successful', data: [] });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    res.json({ message: 'GET ${resource} by ID successful', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    res.status(201).json({ message: 'POST ${resource} successful', data: req.body });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    res.json({ message: 'PUT ${resource} successful', id: req.params.id, data: req.body });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    res.json({ message: 'DELETE ${resource} successful', id: req.params.id });
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
`;
  fs.writeFileSync(path.join(controllersDir, `${resource}Controller.js`), controllerTemplate);

  // Generate Route
  const routeTemplate = `
const express = require('express');
const router = express.Router();
const { requireAuth, requirePermission } = require('../middleware/clerk');
const controller = require('../controllers/${resource}Controller');

// All routes require auth as a baseline
router.use(requireAuth);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
`;
  fs.writeFileSync(path.join(routesDir, `${resource}.js`), routeTemplate);
});

// Update app.js
const appJsPath = path.join(__dirname, 'backend', 'src', 'app.js');
let appJs = fs.readFileSync(appJsPath, 'utf8');

const newAppJs = `const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

${resources.map(r => `const ${r}Routes = require('./routes/${r}');\napp.use('/api/${r}', ${r}Routes);`).join('\n')}

app.use(errorHandler);

module.exports = app;
`;
fs.writeFileSync(appJsPath, newAppJs);

console.log('Backend controllers and routes generated successfully.');
