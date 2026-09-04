import { Share } from "../../data/types";
import { redis } from "./redis";

class SharesStore {
  async get(token: string): Promise<Share | null> {
    const data = await redis.get(`share:${token}`);
    return data as Share | null;
  }

  async set(token: string, share: Share): Promise<void> {
    const ttlSeconds = Math.max(1, Math.floor((new Date(share.expiresAt).getTime() - Date.now()) / 1000));
    await redis.set(`share:${token}`, share, { ex: ttlSeconds });
  }
}

export const sharesStore = new SharesStore();
