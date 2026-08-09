import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
    console.error("CRITICAL: DATABASE_URL environment variable is missing.");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: {
        rejectUnauthorized: false,
    },
});

const query = async (sql, params = [], connection = null) => {
    const executor = connection || pool;
    const { rows } = await executor.query(sql, params);
    return rows;
};

export default query;
