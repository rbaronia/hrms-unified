const db = require('./connection');

async function testUserTypes() {
    try {
        console.log('Testing database connection...');
        const [rows] = await db.query('SELECT 1 as test');
        console.log('Database connection successful:', rows);

        console.log('\nTesting USERTYPE table...');
        const [userTypes] = await db.query('SELECT * FROM USERTYPE');
        console.log('User Types found:', userTypes.length);
        console.table(userTypes);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

testUserTypes();
