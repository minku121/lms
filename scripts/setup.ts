import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function setup() {
  console.log('Connecting to remote MySQL server...');
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    ssl: {
      rejectUnauthorized: false
    }
  });

  console.log('Connected.');

    // Disable foreign key checks for setup
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    try {
      const sqlFile = path.join(process.cwd(), 'schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
   
    const queries = sql
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    for (const query of queries) {
      console.log(`Executing: ${query.substring(0, 50)}...`);
      await connection.query(query);
    }

    console.log('Database and tables initialized successfully!');
  } catch (error) {
    console.error('Error during setup:', error);
  } finally {
    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    await connection.end();
  }

}

setup();
