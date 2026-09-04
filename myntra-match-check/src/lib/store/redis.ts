import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  console.warn("WARNING: Redis credentials (UPSTASH_REDIS_REST_URL or KV_REST_API_URL) are missing.");
}

// Create a new Redis instance.
export const redis = new Redis({
  url: url || 'https://missing-redis-url.example.com', // fallback to valid URL structure to prevent /pipeline parse error
  token: token || 'missing-token',
});

// Wrapper to intercept calls if missing
const originalSet = redis.set.bind(redis);
redis.set = async (key: string, value: any, options?: any) => {
  if (!url) throw new Error("Redis is not configured in this environment. Please set UPSTASH_REDIS_REST_URL.");
  return originalSet(key, value, options);
};

const originalGet = redis.get.bind(redis);
redis.get = async (key: string) => {
  if (!url) throw new Error("Redis is not configured in this environment. Please set UPSTASH_REDIS_REST_URL.");
  return originalGet(key);
};
