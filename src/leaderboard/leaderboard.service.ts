import { Injectable, OnModuleInit } from '@nestjs/common';
import { Leaderboard } from './interface/leaderboard.interface';
import axios from 'axios';

@Injectable()
export class LeaderboardService implements OnModuleInit {
  private readonly LEADERBOARD_URL =
    'https://stats-data.hyperliquid.xyz/Mainnet/leaderboard';
  private readonly REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds
  private cachedLeaderboard: Leaderboard[] = [];

  async onModuleInit() {
    await this.fetchAndUpdateCache();
    setInterval(() => {
      void this.fetchAndUpdateCache();
    }, this.REFRESH_INTERVAL);
  }

  private async fetchAndUpdateCache(): Promise<void> {
    try {
      const response = await axios.get<{ leaderboardRows: Leaderboard[] }>(
        this.LEADERBOARD_URL,
      );

      this.cachedLeaderboard = response.data.leaderboardRows
        .filter((entry) => {
          const accountValue = parseFloat(entry.accountValue);
          const monthlyVolume = entry.windowPerformances[2][1].vlm;
          return accountValue !== 0 && monthlyVolume !== '0.0';
        })
        .sort(
          (a, b) =>
            +b.windowPerformances[0][1].pnl - +a.windowPerformances[0][1].pnl,
        );
    } catch (error) {
      console.error('Error updating leaderboard cache:', error);
    }
  }

  getLeaderboard(): {
    leaderboardRows: Leaderboard[];
  } {
    if (!this.cachedLeaderboard) {
      return {
        leaderboardRows: [],
      };
    }
    try {
      return {
        leaderboardRows: this.cachedLeaderboard,
      };
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      throw error;
    }
  }
}
