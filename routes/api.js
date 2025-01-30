const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./users');
const departmentRoutes = require('./departments');
const userTypeRoutes = require('./userTypes');
const dashboardRoutes = require('./dashboard');
const reporteesRoutes = require('./reportees');

// Mount routes
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/userTypes', userTypeRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reportees', reporteesRoutes);

module.exports = router;
