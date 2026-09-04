import { Check } from "../../data/types";

// In-memory store for development/MVP purposes.
// In production, this would be backed by Vercel KV or a similar Redis store.
class ChecksStore {
  private store: Map<string, Check> = new Map();

  async get(checkId: string): Promise<Check | null> {
    return this.store.get(checkId) || null;
  }

  async set(checkId: string, check: Check): Promise<void> {
    this.store.set(checkId, check);
    
    // Simple mock TTL: delete after 24 hours
    setTimeout(() => {
      this.store.delete(checkId);
    }, 24 * 60 * 60 * 1000);
  }
}

export const checksStore = new ChecksStore();
