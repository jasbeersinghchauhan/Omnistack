import pool from "./db.js";

async function testConnection() {
    try {
        const result = await pool.query(`SELECT NOW()`);
        console.log("Connected to Neon PostgreSQL");
        console.log(result.rows);
    } catch(err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

testConnection();