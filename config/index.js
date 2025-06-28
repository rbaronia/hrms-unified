const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const config = {
    server: {
        // Port must be set in .env (PORT=)
        port: process.env.PORT,
        env: process.env.NODE_ENV || 'development',
    },
    db: {
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT, 10) || 3307,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'hrmsdb',
        connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
        queueLimit: parseInt(process.env.DB_QUEUE_LIMIT, 10) || 0,
        ssl: process.env.NODE_ENV === 'production',
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'logs/hrms.log',
    },
    security: {
        // CORS origins must be set in .env (CORS_ORIGIN=)
        corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [],
        sessionSecret: process.env.SESSION_SECRET || 'default-session-secret',
        jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret',
        jwtExpiration: process.env.JWT_EXPIRATION || '24h',
        bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
    },
    rateLimiting: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100 // limit each IP to 100 requests per windowMs
    },
    cache: {
        ttl: parseInt(process.env.CACHE_TTL, 10) || 60 * 5, // 5 minutes
        checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD, 10) || 60, // 1 minute
    }
};

// Validate required configuration
const validateConfig = () => {
    const required = [
        'db.host',
        'db.port',
        'db.user',
        'db.password',
        'db.database',
    ];

    required.forEach(path => {
        const value = path.split('.').reduce((obj, key) => obj && obj[key], config);
        if (!value) {
            throw new Error(`Missing required configuration: ${path}`);
        }
    });
};

try {
    validateConfig();
} catch (error) {
    console.error('Configuration validation failed:', error.message);
    process.exit(1);
}

module.exports = config;
