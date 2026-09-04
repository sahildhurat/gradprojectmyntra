import { Vote } from "../../data/types";
import { redis } from "./redis";

class VotesStore {
  async getByToken(token: string): Promise<Vote[]> {
    const votes = await redis.lrange(`votes:${token}`, 0, -1);
    return votes.map((v) => JSON.parse(v)) as Vote[];
  }

  async addVote(token: string, vote: Vote): Promise<void> {
    await redis.rpush(`votes:${token}`, JSON.stringify(vote));
    await redis.expire(`votes:${token}`, 24 * 60 * 60); 
  }
}

export const votesStore = new VotesStore();
