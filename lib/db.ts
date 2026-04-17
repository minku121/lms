import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

export const db = mysql.createPool({

  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'lms_db',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  ssl: {
    rejectUnauthorized: false // Required for many managed DBs if you don't have the CA cert
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

