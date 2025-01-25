const db = require('./db/connection');
const logger = require('./logger'); // Update logger path

(async () => {
    try {
        logger.info('Starting database connection test...');

        // Attempt to get a connection from the pool
        const connection = await db.getConnection();
        logger.info('Database connection established successfully.');

        // Run a simple query to ensure the connection is functional
        const [rows] = await connection.query('SELECT 1 AS test');
        logger.info('Test query executed successfully.', { rows });

        connection.release(); // Release the connection back to the pool
        logger.info('Database connection test completed successfully.');
    } catch (error) {
        logger.error(`Database connection test failed: ${error.message}`);
        process.exit(1); // Exit with an error code
    }
})();
