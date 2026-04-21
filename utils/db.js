import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'supply_chain',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log('[DB CONFIG] Initializing MySQL pool...');
console.log(`   Host: ${dbConfig.host}`);
console.log(`   User: ${dbConfig.user}`);
console.log(`   Database: ${dbConfig.database}`);

const pool = mysql.createPool(dbConfig);

export default pool;
