import { errorResponse } from "./response.js";

export const getRedisTTL = async (redis, key) => {
  try {
    const ttl = await redis.ttl(key);
    return ttl;
  } catch (error) {
    console.error("Redis error:", error);
    return errorResponse(null, "Failed to fetch TTL from Redis", error, 500);
  }
};

export const getRedisData = async (redis, key) => {
  try {
    const cachedData = await redis.get(key);
    return JSON.parse(cachedData);
  } catch (error) {
    console.error("Redis error:", error);
    return errorResponse(null, "Failed to fetch data from Redis", error, 500);
  }
};

export const setRedisData = async (redis, key, data, ttl) => {
  try {
    const value = JSON.stringify(data);
    ttl < 0
      ? await redis.setex(key, 60 * 60, value)
      : await redis.set(key, value, "EX", ttl);
  } catch (error) {
    console.error("Redis error:", error);
    return errorResponse(null, "Failed to set data in Redis", error, 500);
  }
};
