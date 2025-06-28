// require('dotenv').config({ path: '../.env' }); // Now loaded in server.js

const config = {
  server: {
    // Port must be set in .env (PORT=)
    port: process.env.PORT,
    env: process.env.NODE_ENV || 'development',
    // Client port must be set in .env (CLIENT_PORT=)
    clientPort: process.env.CLIENT_PORT
  },
  database: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'P@ssw0rd',
    database: process.env.DB_NAME || 'hrmsdb',
    dialect: 'mysql',
    ssl: process.env.DB_SSL === 'true' || false,
    allowPublicKeyRetrieval: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT, 10) || 0,
    pool: {
      max: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  security: {
    // CORS origins must be set in .env (CORS_ORIGIN=)
    corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [],
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret-key'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filename: process.env.LOG_FILE || 'logs/hrms.log',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    format: {
      timestamp: true,
      colorize: true
    }
  }
};

module.exports = config;
