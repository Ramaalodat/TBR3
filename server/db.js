const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  ssl: {
    rejectUnauthorized: false, 
  }
});

module.exports = pool;
