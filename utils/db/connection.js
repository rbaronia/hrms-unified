const mysql = require('mysql2/promise');
const config = require('../../config');
const logger = require('../logger');

// Create a connection pool
let pool;
try {
    pool = mysql.createPool({
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
        waitForConnections: true,
        connectionLimit: config.db.connectionLimit,
        queueLimit: config.db.queueLimit,
        ssl: config.db.ssl ? { rejectUnauthorized: false } : undefined
    });

    logger.info('Database connection pool successfully created.', {
        host: config.db.host,
        database: config.db.database,
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
