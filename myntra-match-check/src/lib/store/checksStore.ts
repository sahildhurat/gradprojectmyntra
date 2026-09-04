import { Check } from "../../data/types";
import { redis } from "./redis";

class ChecksStore {
  async get(checkId: string): Promise<Check | null> {
    const data = await redis.get(`check:${checkId}`);
    return data as Check | null;
  }

  async set(checkId: string, check: Check): Promise<void> {
    // Save with a 24-hour expiry (in seconds)
    await redis.set(`check:${checkId}`, check, { ex: 24 * 60 * 60 });
  }
}

export const checksStore = new ChecksStore();
