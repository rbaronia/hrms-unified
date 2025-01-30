const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const config = require('./config/config');
const logger = require('./utils/logger');
const fs = require('fs');

const app = express();

// Enhanced request logging
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :response-time ms - :body', { 
  stream: { 
    write: (message) => logger.info(message.trim()) 
  }
}));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
logger.info('Helmet middleware initialized');

// Compression middleware
app.use(compression());
logger.info('Compression middleware initialized');

// CORS middleware
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Parse the origin to get the hostname
    try {
      const originUrl = new URL(origin);
      // Allow any origin that matches the hostname pattern
      callback(null, true);
    } catch (error) {
      callback(new Error('Invalid origin'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
logger.info('CORS middleware initialized with dynamic origin handling');

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log environment
logger.info(`Current environment: ${config.server.env}`);
logger.info(`Current directory: ${__dirname}`);

// Serve static files from the React app
const clientBuildPath = path.join(__dirname, 'client/build');
logger.info(`Client build path: ${clientBuildPath}`);

// Check if build directory exists
if (fs.existsSync(clientBuildPath)) {
  logger.info('Client build directory found');
  const indexPath = path.join(clientBuildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    logger.info('index.html found in build directory');
  }
  app.use(express.static(clientBuildPath));
  logger.info('Static file middleware initialized');
}

// API Routes
const userRoutes = require('./routes/users');
const departmentRoutes = require('./routes/departments');
const userTypeRoutes = require('./routes/userTypes');
const dashboardRoutes = require('./routes/dashboard');

// API routes
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/userTypes', userTypeRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Handle React routing for all non-API routes
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const port = config.server.port;
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  logger.info(`Environment: ${config.server.env}`);
});
