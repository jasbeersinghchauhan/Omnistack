import { createClient } from "redis";

if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL is not defined");
}

const redis = createClient({
    url: process.env.REDIS_URL,
});

redis.on("error", (error) => {
    console.error("Redis Client Error:", error);
});

redis.on("connect", () => {
    console.log("Redis connecting...");
});

redis.on("ready", () => {
    console.log("Redis connected.");
});

redis.on("reconnecting", () => {
    console.log("Redis reconnecting...");
});

redis.on("end", () => {
    console.log("Redis connection closed.");
});

export const connectRedis = async () => {
    if (!redis.isOpen) {
        await redis.connect();
    }
};

export const disconnectRedis = async () => {
    if (redis.isOpen) {
        await redis.quit();
    }
};

export default redis;