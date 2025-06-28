// Script to connect to MySQL using your Sequelize config, and print schema and data for all tables
// Always load environment variables from .env
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const config = require('../config');

async function dumpSchemaAndData() {
  const dbConf = config.db;
  const connection = await mysql.createConnection({
    host: dbConf.host,
    port: dbConf.port,
    user: dbConf.user,
    password: dbConf.password,
    database: dbConf.database,
    ssl: dbConf.ssl ? { rejectUnauthorized: false } : undefined,
  });
  try {
    // Get all tables
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    for (const table of tableNames) {
      console.log(`\n=== Schema for table: ${table} ===`);
      const [desc] = await connection.query(`DESCRIBE \
${table}
`);
      console.table(desc);
      console.log(`\n=== Data from table: ${table} ===`);
      const [rows] = await connection.query(`SELECT * FROM \
${table}
 LIMIT 10`);
      console.table(rows);
    }
    await connection.end();
  } catch (err) {
    console.error('Error dumping DB:', err);
    process.exit(1);
  }
}

dumpSchemaAndData();
