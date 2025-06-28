require('dotenv').config();

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

// API routes
app.use('/api', require('./routes/api'));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Extra logging for env file and port
logger.info(`process.env.PORT: ${process.env.PORT}`);
logger.info(`Resolved config.server.port: ${config.server.port}`);
logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);
try {
  const envFilePath = require('path').resolve(__dirname, '.env');
  logger.info(`Attempting to load .env file from: ${envFilePath}`);
} catch (e) {
  logger.warn('Could not resolve .env file path');
}
// Start server
const port = config.server.port;
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  logger.info(`Environment: ${config.server.env}`);
});
