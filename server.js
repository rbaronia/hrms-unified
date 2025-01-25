const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const config = require('./config/config');
const logger = require('./utils/logger');
const fs = require('fs');
const db = require('./utils/db/connection');

const app = express();

// Enhanced request logging
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :response-time ms - :body', { 
  stream: { 
    write: (message) => logger.info(message.trim()) 
  }
}));

// Security middleware with logging
app.use(helmet({
  contentSecurityPolicy: false,
}));
logger.info('Helmet middleware initialized');

app.use(compression());
logger.info('Compression middleware initialized');

app.use(cors());
logger.info('CORS middleware initialized');

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log the environment
logger.info(`Current environment: ${process.env.NODE_ENV}`);
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
  } else {
    logger.error('index.html not found in build directory');
  }
} else {
  logger.error('Client build directory not found');
}

app.use(express.static(clientBuildPath));
logger.info('Static file middleware initialized');

// Import routes
const employeeRoutes = require('./routes/employees');
const departmentRoutes = require('./routes/departments');
const userTypeRoutes = require('./routes/userTypes');

// API routes
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/userTypes', userTypeRoutes);

// Log all requests
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  logger.info(`Headers: ${JSON.stringify(req.headers)}`);
  next();
});

// Handle React routing for all non-API routes
app.get('*', (req, res, next) => {
  logger.info(`Handling route: ${req.path}`);
  
  // Skip this middleware for API routes
  if (req.path.startsWith('/api/')) {
    logger.info('Skipping React routing for API path');
    return next();
  }

  const indexPath = path.join(clientBuildPath, 'index.html');
  logger.info(`Attempting to serve: ${indexPath}`);

  if (fs.existsSync(indexPath)) {
    logger.info('Serving index.html');
    res.sendFile(indexPath);
  } else {
    logger.error('index.html not found');
    res.status(500).send('Server configuration error: index.html not found');
  }
});

// 404 handler for API routes only
app.use('/api/*', (req, res) => {
  logger.warn(`API 404: ${req.method} ${req.url}`);
  res.status(404).json({
    error: {
      message: 'API endpoint not found',
      status: 404
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error details:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    headers: req.headers
  });
  
  // Handle specific errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        message: 'Validation Error',
        details: err.message
      }
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: {
        message: 'Unauthorized',
        details: err.message
      }
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

const PORT = process.env.PORT || config.server.port;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
