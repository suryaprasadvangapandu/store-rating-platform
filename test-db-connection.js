const { Pool } = require('pg');

// Common passwords to try
const passwords = ['admin', 'postgres', 'password', '123456', 'root', ''];

async function testConnection(password) {
    const pool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'store_rating_platform',
        user: 'postgres',
        password: password,
        max: 1,
        idleTimeoutMillis: 5000,
        connectionTimeoutMillis: 5000,
    });

    try {
        const client = await pool.connect();
        console.log(`✅ SUCCESS! Password is: "${password}"`);
        await client.release();
        await pool.end();
        return true;
    } catch (err) {
        console.log(`❌ Failed with password: "${password}" - ${err.message}`);
        await pool.end();
        return false;
    }
}

async function findPassword() {
    console.log('Testing common PostgreSQL passwords...\n');
    
    for (const password of passwords) {
        const success = await testConnection(password);
        if (success) {
            console.log(`\n🎉 Found working password: "${password}"`);
            console.log('Update your server/config/database.js with this password!');
            break;
        }
    }
}

findPassword().catch(console.error);
