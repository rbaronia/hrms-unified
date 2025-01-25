const mysql = require('mysql2/promise');
const path = require('path');
const PropertiesReader = require('properties-reader');
const logger = require('../logger'); // Update logger path

// Path to the properties file
const PROPERTIES_FILE = path.resolve(__dirname, '../../config.properties');

// Load database configuration from the properties file
let dbConfig;
try {
    const properties = PropertiesReader(PROPERTIES_FILE);
    const jdbcUrl = properties.get('db.jdbcUrl');

    if (!jdbcUrl) {
        throw new Error("JDBC URL (db.jdbcUrl) is missing in the configuration file.");
    }

    // Parse the JDBC URL to extract connection parameters
    const [url, query] = jdbcUrl.split('?');
    const params = new URLSearchParams(query);

    // Extract port more reliably from the JDBC URL
    const portMatch = url.match(/:(\d+)\//);
    const port = portMatch ? parseInt(portMatch[1]) : 3306;

    dbConfig = {
        host: '127.0.0.1', // Using IP instead of 'localhost' to force TCP
        port: port,
        user: params.get('user'),
        password: params.get('password'),
        database: url.split('/').pop(),
        waitForConnections: true,
        connectionLimit: parseInt(properties.get('db.connectionLimit') || '10'), // Optional
        queueLimit: parseInt(properties.get('db.queueLimit') || '0'), // Optional
        ssl: params.get('ssl') ? { rejectUnauthorized: false } : undefined, // Optional SSL support
    };

    logger.info('Database configuration successfully loaded from properties file.', {
        host: dbConfig.host,
        database: dbConfig.database,
    });
} catch (error) {
    logger.error(`Error reading database configuration file: ${error.message}`);
    process.exit(1); // Exit if the configuration cannot be loaded
}

// Create a connection pool
let pool;
try {
    pool = mysql.createPool(dbConfig);
    logger.info('Database connection pool successfully created.');
} catch (error) {
    logger.error(`Error creating database connection pool: ${error.message}`);
    process.exit(1); // Exit if the connection pool cannot be created
}

// Function to verify the pool connection
const verifyPoolConnection = async () => {
    try {
        const connection = await pool.getConnection();
        if (!connection) {
            throw new Error('Failed to obtain a connection from the pool.');
        }
        logger.info('Database connection from pool established successfully.');
        connection.release(); // Release the connection back to the pool
    } catch (error) {
        logger.error(`Database connection pool verification failed: ${error.message}`);
        process.exit(1); // Exit the application if pool verification fails
    }
};

// Verify the connection pool on startup
verifyPoolConnection();

module.exports = pool;
