// Node.js script to atomically migrate DEPARTMENT.DEPTID to AUTO_INCREMENT
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

    // 1. Create new table with AUTO_INCREMENT
    await db.query(`CREATE TABLE DEPARTMENT_NEW (
      DEPTID INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY,
      DEPTNAME VARCHAR(36) NOT NULL,
      PARENTID INTEGER,
      INDEX (PARENTID)
    ) ENGINE=InnoDB`);
    console.log('Created DEPARTMENT_NEW with AUTO_INCREMENT.');

    // 2. Copy data
    await db.query('INSERT INTO DEPARTMENT_NEW (DEPTID, DEPTNAME, PARENTID) SELECT DEPTID, DEPTNAME, PARENTID FROM DEPARTMENT');
    console.log('Copied data to DEPARTMENT_NEW.');

    // 3. Drop old table
    await db.query('DROP TABLE DEPARTMENT');
    console.log('Dropped old DEPARTMENT table.');

    // 4. Rename new table
    await db.query('RENAME TABLE DEPARTMENT_NEW TO DEPARTMENT');
    console.log('Renamed DEPARTMENT_NEW to DEPARTMENT.');

    // 5. Re-add self-referencing FK
    await db.query('ALTER TABLE DEPARTMENT ADD CONSTRAINT DEPARTMENT_ibfk_1 FOREIGN KEY (PARENTID) REFERENCES DEPARTMENT(DEPTID)');
    console.log('Re-added DEPARTMENT self-referencing foreign key.');

    // 6. Add USER.DEPTID FK to DEPARTMENT.DEPTID if not present
    await db.query('ALTER TABLE USER ADD CONSTRAINT USER_ibfk_dept FOREIGN KEY (DEPTID) REFERENCES DEPARTMENT(DEPTID)');
    console.log('Added USER foreign key USER_ibfk_dept.');

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await db.end();
  }
})();
