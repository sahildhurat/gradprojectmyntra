import { Vote } from "../../data/types";
import { redis } from "./redis";

class VotesStore {
  async getByToken(token: string): Promise<Vote[]> {
    try {
      const votes = await redis.lrange(`votes:${token}`, 0, -1);
      // Upstash parses JSON automatically, but handle both string and object just in case
      return votes.map(v => typeof v === 'string' ? JSON.parse(v) : v) as Vote[];
    } catch (error) {
      console.error("Error in getByToken:", error);
      return [];
    }
  }

  async addVote(token: string, vote: Vote): Promise<void> {
    await redis.rpush(`votes:${token}`, vote);
    await redis.expire(`votes:${token}`, 24 * 60 * 60); 
  }
}

export const votesStore = new VotesStore();
