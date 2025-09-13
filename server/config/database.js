const { Pool } = require('pg');
require('dotenv').config();

// Use DATABASE_URL if available (for production), otherwise use individual variables (for development)
let config;

if (process.env.DATABASE_URL) {
    console.log('Using DATABASE_URL for connection');
    config = {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    };
} else {
    console.log('Using individual DB variables for connection');
    config = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'store_rating_platform',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'nani@123',
    };
}

console.log('Database config:', process.env.DATABASE_URL ? 'Using DATABASE_URL' : 'Using individual variables');

const pool = new Pool({
    ...config,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
    console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Database connection error:', err);
});

module.exports = pool;
