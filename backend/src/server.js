import app from "./app.js";
import {
    connectRedis,
    disconnectRedis,
} from "./infrastructure/redis/redis.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await connectRedis();

        const server = app.listen(PORT, () => {
            console.log(`Server running on ${PORT}`);
        });

        const shutdown = async (signal) => {
            console.log(`${signal} received. Shutting down...`);

            server.close(async () => {
                await disconnectRedis();
                process.exit(0);
            });
        };

        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));

    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();