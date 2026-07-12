const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const usersRoutes = require('./routes/users');
app.use('/api/users', usersRoutes);
const rolesRoutes = require('./routes/roles');
app.use('/api/roles', rolesRoutes);
const vehiclesRoutes = require('./routes/vehicles');
app.use('/api/vehicles', vehiclesRoutes);
const driversRoutes = require('./routes/drivers');
app.use('/api/drivers', driversRoutes);
const tripsRoutes = require('./routes/trips');
app.use('/api/trips', tripsRoutes);
const maintenanceRoutes = require('./routes/maintenance');
app.use('/api/maintenance', maintenanceRoutes);
const fuelRoutes = require('./routes/fuel');
app.use('/api/fuel', fuelRoutes);
const expensesRoutes = require('./routes/expenses');
app.use('/api/expenses', expensesRoutes);
const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);
const reportsRoutes = require('./routes/reports');
app.use('/api/reports', reportsRoutes);
const notificationsRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationsRoutes);
const auditLogsRoutes = require('./routes/auditLogs');
app.use('/api/auditLogs', auditLogsRoutes);
const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);

app.use(errorHandler);

module.exports = app;
