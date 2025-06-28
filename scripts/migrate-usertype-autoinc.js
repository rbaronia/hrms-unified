// Node.js script to atomically migrate USERTYPE.TYPEID to AUTO_INCREMENT
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

(async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });
  try {
    // No USER.TYPEID FK to drop; will add after migration

    // 1. Create new table with AUTO_INCREMENT
    await db.query(`CREATE TABLE USERTYPE_NEW (
      TYPEID INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
      TYPENAME VARCHAR(36) NOT NULL
    ) ENGINE=InnoDB`);
    console.log('Created USERTYPE_NEW with AUTO_INCREMENT.');

    // 2. Copy data
    await db.query('INSERT INTO USERTYPE_NEW (TYPEID, TYPENAME) SELECT TYPEID, TYPENAME FROM USERTYPE');
    console.log('Copied data to USERTYPE_NEW.');

    // 3. Drop old table
    await db.query('DROP TABLE USERTYPE');
    console.log('Dropped old USERTYPE table.');

    // 4. Rename new table
    await db.query('RENAME TABLE USERTYPE_NEW TO USERTYPE');
    console.log('Renamed USERTYPE_NEW to USERTYPE.');

    // 5. Re-add FK from USER.TYPEID to USERTYPE.TYPEID
    await db.query('ALTER TABLE USER ADD CONSTRAINT USER_ibfk_type FOREIGN KEY (TYPEID) REFERENCES USERTYPE(TYPEID)');
    console.log('Re-added USER foreign key USER_ibfk_type.');

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await db.end();
  }
})();
