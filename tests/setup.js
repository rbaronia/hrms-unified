const { MongoMemoryServer } = require('mongodb-memory-server');
const mysql = require('mysql2/promise');
const config = require('../config');

let mongoServer;
let mysqlConnection;

// Setup function
beforeAll(async () => {
    // Setup test database connection
    mysqlConnection = await mysql.createConnection({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database
    });

    // Create test tables if needed
    await setupTestTables();
});

// Teardown function
afterAll(async () => {
    if (mysqlConnection) {
        await mysqlConnection.end();
    }
});

// Helper to setup test tables
async function setupTestTables() {
    // Add your table creation scripts here
    const createTableQueries = [
        `CREATE TABLE IF NOT EXISTS TEST_USER (
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(255) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,
        // Add more table creation queries as needed
    ];

    for (const query of createTableQueries) {
        await mysqlConnection.query(query);
    }
}

// Export the connection for use in tests
module.exports = {
    getConnection: () => mysqlConnection
};
