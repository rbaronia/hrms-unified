const mysql = require('mysql2/promise');
const path = require('path');
const PropertiesReader = require('properties-reader');

async function checkDatabase() {
    // Load database configuration from the properties file
    const PROPERTIES_FILE = path.resolve(__dirname, '../../config.properties');
    const properties = PropertiesReader(PROPERTIES_FILE);
    const jdbcUrl = properties.get('db.jdbcUrl');

    // Parse the JDBC URL to extract connection parameters
    const [url, query] = jdbcUrl.split('?');
    const params = new URLSearchParams(query);
    const portMatch = url.match(/:(\d+)\//);
    const port = portMatch ? parseInt(portMatch[1]) : 3306;

    const dbConfig = {
        host: '127.0.0.1',
        port: port,
        user: params.get('user'),
        password: params.get('password'),
        database: url.split('/').pop()
    };

    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database successfully');

        // Check USERTYPE table
        const [userTypes] = await connection.query('SELECT * FROM USERTYPE');
        console.log('\nUser Types in database:');
        console.table(userTypes);

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkDatabase();
