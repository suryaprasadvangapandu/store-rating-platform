const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'store_rating_platform',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'nani@123',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

async function testConnection() {
    try {
        console.log('Testing database connection...');
        const client = await pool.connect();
        console.log('✅ Database connected successfully!');
        
        // Test a simple query
        const result = await client.query('SELECT COUNT(*) FROM users');
        console.log('✅ Query successful! User count:', result.rows[0].count);
        
        await client.release();
        await pool.end();
        console.log('✅ Connection closed successfully!');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Full error:', error);
    }
}

testConnection();

