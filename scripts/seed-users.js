// Script to seed USER table using sample data from new_schema.sql
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

const users = [
  [ 'Cassandra', 'Shaner', null, 'Syracuse', 'NY', null, 'Industry Energy Buyer', null, '1', 'Secondary', '0', 104, null, 'CShaner' ],
  [ 'Debora', 'Brittain', null, 'Montgomery', 'AL', null, null, null, '1', 'Tertiary', '0', 105, 100, 'DBrittain' ],
  [ 'David', 'Fox', null, 'Oakland', 'CA', null, null, null, '1', 'Upper Secondary', '0', 127, null, 'DFox' ],
  [ 'David', 'Sparkman', null, 'Mill Valley', 'CA', null, 'Recruiter', null, '1', 'Upper Secondary', '0', 125, null, 'DSparkman' ],
  [ 'Elizabeth', 'Kimble', null, 'Cleveland', 'OH', null, null, null, '1', 'Post-Secondary', '0', 114, 100, 'EKimble' ],
  [ 'Helen', 'Hayward', null, 'New York', 'NY', null, null, null, '1', 'NA', '0', 116, 100, 'HHayward' ],
  [ 'Jasmine', 'Goodwin', null, 'Madison', 'FL', null, null, null, '1', 'Upper Secondary', '0', 102, 104, 'JGoodwin' ],
  [ 'Jean', 'Hicks', null, 'Abbyville', 'KS', null, null, null, '1', 'Upper Secondary', '0', 111, 100, 'JHicks' ],
  [ 'Jessica', 'Hillis', null, 'High Point', 'MO', null, null, null, '1', 'Upper Secondary', '0', 114, 100, 'JHillis' ],
  [ 'Jeffrey', 'Turner', null, 'Los Angeles', 'CA', null, null, null, '1', 'Upper Secondary', '0', 111, null, 'JTurner' ],
  [ 'Leon', 'Dinh', null, 'Mountain View', 'CA', null, null, null, '1', 'Upper Secondary', '0', 111, 104, 'LDinh' ],
  [ 'Leann', 'Greenleaf', null, 'Pittsburgh', 'PA', null, null, null, '1', 'Post-Secondary', '0', 118, 100, 'LGreenleaf' ],
  [ 'Mark', 'Anderson', null, 'Richmond', 'VA', null, null, null, '1', 'Upper Secondary', '0', 127, 104, 'MAnderson' ],
  [ 'Mary', 'Nunez', null, 'Butte', 'NE', null, null, null, '1', 'Upper Secondary', '0', 119, 100, 'MNunez' ],
  [ 'Marcelo', 'Perez', null, 'Laramie', 'WY', null, null, null, '1', 'Upper Secondary', '0', 104, 104, 'MPerez' ],
  [ 'Mark', 'Powers', null, 'Corpus Christi', 'TX', null, null, null, '1', 'Upper Secondary', '0', 105, 104, 'MPowers' ],
  [ 'Misty', 'Scott', null, 'Vineland', 'NJ', null, 'Residential Energy Buyer', null, '1', 'Secondary', '0', 124, 104, 'MScott' ],
  [ 'Rose', 'Bremner', null, 'Manchester', 'NH', null, null, null, '1', 'Upper Secondary', '0', 111, 100, 'RBremner' ],
  [ 'Robert', 'Fassett', null, 'New York', 'NY', null, null, null, '1', 'Upper Secondary', '0', 125, null, 'RFassett' ],
  [ 'Shirley', 'Chang', null, 'Abbyville', 'KS', null, null, null, '1', 'Upper Secondary', '0', 111, 100, 'SChang' ],
  [ 'John', 'Smith', null, 'Abbyville', 'KS', null, null, null, '1', 'Upper Secondary', '0', 111, 100, 'JSmith' ],
];

const insertSql = `INSERT INTO USER (FIRSTNAME,LASTNAME,STREETADDR,CITY,STATE,ZIPCODE,TITLE,MANAGER,ISMANAGER,EDULEVEL,STATUS,DEPTID,TYPEID,USERID,DATE_MODIFIED) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)`;

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
    await db.query('DELETE FROM USER'); // clear table before seeding
    for (const u of users) {
      await db.query(insertSql, u);
    }
    console.log('Seeded USER table with demo data.');
  } catch (err) {
    console.error('Error seeding USER table:', err);
  } finally {
    await db.end();
  }
})();
