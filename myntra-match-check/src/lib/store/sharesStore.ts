import { Share } from "../../data/types";

class SharesStore {
  private store: Map<string, Share> = new Map();

  async get(token: string): Promise<Share | null> {
    return this.store.get(token) || null;
  }

  async set(token: string, share: Share): Promise<void> {
    this.store.set(token, share);
    
    // Automatically delete after expiration (24h)
    setTimeout(() => {
      this.store.delete(token);
    }, new Date(share.expiresAt).getTime() - Date.now());
  }
}

export const sharesStore = new SharesStore();
