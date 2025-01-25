const winston = require('winston');
const path = require('path');
const PropertiesReader = require('properties-reader');

// Load configuration from properties file
const properties = PropertiesReader(path.resolve(__dirname, '../config.properties'));

const logger = winston.createLogger({
    level: properties.get('logging.level') || 'info',
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
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

// Create a stream object for Morgan middleware
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

module.exports = logger;
