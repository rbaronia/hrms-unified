const mysql = require('mysql2/promise');
const path = require('path');
const PropertiesReader = require('properties-reader');

async function updateUserTypes() {
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

        // Update user types
        await connection.query('DELETE FROM USERTYPE');
        
        const userTypes = [
            [100, 'Administrator'],
            [101, 'Manager'],
            [102, 'Regular Employee'],
            [103, 'Contractor'],
            [104, 'HR Staff']
        ];

        await connection.query(
            'INSERT INTO USERTYPE (TYPEID, TYPENAME) VALUES ?',
            [userTypes]
        );

        console.log('User types updated successfully');

        // Verify the update
        const [updatedTypes] = await connection.query('SELECT * FROM USERTYPE');
        console.log('\nUpdated User Types:');
        console.table(updatedTypes);

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

updateUserTypes();
