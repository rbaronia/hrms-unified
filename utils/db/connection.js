const mysql = require('mysql2/promise');
const config = require('../../config');
const logger = require('../logger');

// Create a connection pool
let pool;
try {
    pool = mysql.createPool({
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        password: config.database.password,
        database: config.database.database,
        waitForConnections: true,
        connectionLimit: config.database.connectionLimit,
        queueLimit: config.database.queueLimit,
        ssl: config.database.ssl ? { rejectUnauthorized: false } : undefined
    });

    logger.info('Database connection pool successfully created.', {
        host: config.database.host,
        database: config.database.database,
    });
} catch (error) {
    logger.error(`Error creating database connection pool: ${error.message}`);
    process.exit(1);
}

// Function to verify the pool connection
async function verifyPoolConnection() {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        logger.info('Database connection pool verified successfully.');
    } catch (error) {
        logger.error(`Database connection pool verification failed: ${error.message}`);
        process.exit(1);
    }
}

// Verify the connection pool on startup
verifyPoolConnection();

module.exports = pool;
