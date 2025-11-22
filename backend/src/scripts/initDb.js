const { Pool } = require('pg');
const { createTables } = require('../config/schema');
require('dotenv').config();

const initializeDatabase = async () => {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   StockMaster Database Initialization      ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // First connect to default postgres database to create our database
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  try {
    // Check if database exists
    const dbName = process.env.DB_NAME || 'stockmaster_db';
    const checkDb = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkDb.rows.length === 0) {
      console.log(`Creating database: ${dbName}...`);
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✓ Database ${dbName} created successfully\n`);
    } else {
      console.log(`✓ Database ${dbName} already exists\n`);
    }

    await adminPool.end();

    // Now create tables
    await createTables();

    console.log('\n✅ Database initialization completed successfully!');
    console.log('\nYou can now run: npm run seed (to add sample data)');
    console.log('Or run: npm run dev (to start the server)\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

initializeDatabase();
