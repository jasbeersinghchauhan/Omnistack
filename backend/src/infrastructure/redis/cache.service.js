import redis from "./redis.js";

export const getCache = async (key) => {
    try {
        const data = await redis.get(key);

        if (!data) {
            return null;
        }

        return JSON.parse(data);
    } catch (error) {
        console.error("Redis GET error:", error);
        return null;
    }
};

export const setCache = async (key, data, ttl = 300) => {
    try {
        await redis.set(key, JSON.stringify(data), {
            EX: ttl,
        });
    } catch (error) {
        console.error("Redis SET error:", error);
    }
};

export const deleteCache = async (key) => {
    try {
        await redis.del(key);
    } catch (error) {
        console.error("Redis DELETE error:", error);
    }
};