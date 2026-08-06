import query from "./db.js";

async function testConnection() {
    try {
        const rows = await query("SELECT NOW() AS current_time");

        console.log("Successfully connected to PostgreSQL.");
        console.log("Database Time:", rows[0].current_time);
    } catch (error) {
        console.error("Failed to connect to PostgreSQL.");
        console.error(error.message);

        if (error.cause) {
            console.error("Cause:", error.cause.message);
        }

        process.exit(1);
    }
}

testConnection();