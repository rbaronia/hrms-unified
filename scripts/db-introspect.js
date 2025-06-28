// Script to introspect current MySQL DB schema using Sequelize config
const { sequelize } = require('../models');

async function introspect() {
  try {
    // Get all tables
    const [tables] = await sequelize.query('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);

    console.log('Database Tables:');
    tableNames.forEach(t => console.log('  -', t));

    for (const table of tableNames) {
      console.log(`\nSchema for table: ${table}`);
      const [desc] = await sequelize.query(`DESCRIBE ${table}`);
      console.table(desc);
    }
    await sequelize.close();
  } catch (err) {
    console.error('Error introspecting DB:', err);
    process.exit(1);
  }
}

introspect();
