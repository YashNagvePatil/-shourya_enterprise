import Redis from "ioredis";
import { config } from "./config.js";

const redis = new Redis({
  host: config.REDIS_HOST,
  port: Number(config.REDIS_PORT) || 6379,
  password: config.REDIS_PASSWORD || undefined,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableOfflineQueue: false,
});

redis.on("connect", () => {
  console.log("✅ [REDIS] Connected to Redis server successfully");
});

redis.on("error", (err) => {
  console.warn("⚠️ [REDIS WARNING]:", err.message);
});

/**
 * Express Middleware for GET APIs with automatic failover if Redis is offline
 * @param {number} ttlInSeconds - Cache duration in seconds (default 300s / 5 mins)
 * @param {string} keyPrefix - Prefix for grouping keys in Redis (e.g. 'products')
 */
export const cacheMiddleware = (ttlInSeconds = 300, keyPrefix = "cache") => {
  return async (req, res, next) => {
    // Generate unique key based on prefix + full requested route URL (includes query params)
    const cacheKey = `${keyPrefix}:${req.originalUrl}`;

    try {
      if (redis.status !== "ready") {
        return next(); // Fallback to DB if Redis is offline
      }

      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log(`⚡ [REDIS HIT] Cache returned for key: ${cacheKey}`);
        return res.status(200).json(JSON.parse(cachedData));
      }

      console.log(`🐢 [REDIS MISS] Querying Database for key: ${cacheKey}`);

      // Intercept res.json to store the DB response in Redis before sending
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300 && body?.success !== false) {
          redis.setex(cacheKey, ttlInSeconds, JSON.stringify(body)).catch((err) => {
            console.error("⚠️ [REDIS SET ERROR]:", err.message);
          });
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error("⚠️ [REDIS MIDDLEWARE ERROR]:", err.message);
      next();
    }
  };
};

/**
 * Invalidate/Delete cache keys matching a pattern when data changes (e.g. "products:*")
 * @param {string} pattern - Key pattern to search and delete
 */
export const clearCachePattern = async (pattern) => {
  try {
    if (redis.status !== "ready") return;

    const keys = await redis.keys(pattern);
    if (keys && keys.length > 0) {
      await redis.del(keys);
      console.log(`🧹 [REDIS CACHE CLEARED] Removed ${keys.length} key(s) matching pattern: '${pattern}'`);
    }
  } catch (err) {
    console.error("⚠️ [REDIS CLEAR PATTERN ERROR]:", err.message);
  }
};

export default redis;