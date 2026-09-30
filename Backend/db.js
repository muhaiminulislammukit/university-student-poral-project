const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'csc114_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;
try {
  pool = mysql.createPool(dbConfig);
  console.log(`[DB] MySQL pool initialized for database: ${dbConfig.database}`);
} catch (err) {
  console.warn(`[DB Warning] Could not connect to MySQL: ${err.message}. Server will run in mock mode.`);
}

module.exports = pool;
