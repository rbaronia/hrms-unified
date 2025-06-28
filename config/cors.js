const config = require('./config');
const logger = require('../utils/logger');

// Default CORS options
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true);
        }

        // Check if the origin is in the allowed list
        const allowedOrigins = config.cors.allowedOrigins;

        // Allow all origins in development
        if (config.env === 'development' && allowedOrigins.includes('*')) {
            return callback(null, true);
        }

        // Check if the origin is allowed
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Log unauthorized origins
        logger.warn(`CORS: Blocked request from unauthorized origin: ${origin}`);

        // Deny the request
        return callback(new Error('Not allowed by CORS'));
    },

    // Allowed HTTP methods
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    // Allowed request headers
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'X-Access-Token',
        'X-Refresh-Token',
    ],

    // Expose headers to the client
    exposedHeaders: ['Content-Range', 'X-Total-Count', 'X-Access-Token', 'X-Refresh-Token'],

    // Allow credentials (cookies, authorization headers, etc.)
    credentials: true,

    // Cache preflight requests for 1 day
    maxAge: 86400,

    // Enable preflight requests for all routes
    preflightContinue: false,

    // Set the status code for successful OPTIONS requests
    optionsSuccessStatus: 204,
};

// Middleware to handle CORS preflight requests
const corsMiddleware = (req, res, next) => {
    // Set CORS headers for all responses
    const origin = req.headers.origin;

    // Check if the origin is allowed
    if (corsOptions.origin) {
        corsOptions.origin(origin, (err, isAllowed) => {
            if (err || !isAllowed) {
                // If not allowed, set CORS headers but don't proceed
                res.header('Access-Control-Allow-Origin', '');
                res.header('Access-Control-Allow-Methods', corsOptions.methods.join(','));
                res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(','));
                res.header('Access-Control-Allow-Credentials', 'true');
                return next();
            }

            // If allowed, set CORS headers and proceed
            res.header('Access-Control-Allow-Origin', origin);
            res.header('Access-Control-Allow-Methods', corsOptions.methods.join(','));
            res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(','));
            res.header('Access-Control-Expose-Headers', corsOptions.exposedHeaders.join(','));
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Access-Control-Max-Age', corsOptions.maxAge);

            // Handle preflight requests
            if (req.method === 'OPTIONS') {
                return res.status(corsOptions.optionsSuccessStatus).end();
            }

            return next();
        });
    } else {
        return next();
    }
};

module.exports = {
    corsOptions,
    corsMiddleware,
};
