import { Vote } from "../../data/types";

class VotesStore {
  private store: Map<string, Vote[]> = new Map();

  async getByToken(token: string): Promise<Vote[]> {
    return this.store.get(token) || [];
  }

  async addVote(token: string, vote: Vote): Promise<void> {
    const votes = this.store.get(token) || [];
    votes.push(vote);
    this.store.set(token, votes);
  }
}

export const votesStore = new VotesStore();
