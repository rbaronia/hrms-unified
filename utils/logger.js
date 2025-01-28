const winston = require('winston');
const path = require('path');
const config = require('../config');

const logger = winston.createLogger({
    level: config.logging.level,
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'hrms-service' },
    transports: [
        // Console transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        // File transport
        new winston.transports.File({
            filename: config.logging.file,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        })
    ]
});

// Ensure log directory exists
const fs = require('fs');
const logDir = path.dirname(config.logging.file);
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Create a stream object for Morgan middleware
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

module.exports = logger;
