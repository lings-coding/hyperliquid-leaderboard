import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  Leaderboard,
  LeaderboardQueryBody,
} from './interface/leaderboard.interface';
import axios from 'axios';

@Injectable()
export class LeaderboardService implements OnModuleInit {
  private latestId: number | null = null;
  private readonly LEADERBOARD_URL =
    'https://stats-data.hyperliquid.xyz/Mainnet/leaderboard';
  private readonly REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
  private cachedLeaderboard: Record<number, Leaderboard[]> = {};

  async onModuleInit() {
    await this.syncLeaderboard();
  }

  private async syncLeaderboard() {
    const id = await this.fetchAndUpdateCache();
    setTimeout(
      () => {
        this.syncLeaderboard().catch((error) => {
          console.error('Error syncing leaderboard:', error);
        });
      },
      id ? this.REFRESH_INTERVAL : 5_000,
    );
  }

  private async fetchAndUpdateCache(): Promise<number | null> {
    try {
      console.log('Fetching leaderboard...');
      const response = await axios.get<{ leaderboardRows: Leaderboard[] }>(
        this.LEADERBOARD_URL,
      );

      if (
        !response.data?.leaderboardRows ||
        response.data.leaderboardRows.length === 0
      )
        throw new Error('No leaderboard data found');
      const id = Date.now();
      console.log(
        `[${id}] Leaderboard updated with ${response.data.leaderboardRows.length} rows`,
      );
      this.cachedLeaderboard[id] = response.data.leaderboardRows;
      this.latestId = id;

      // clear outdated leaderboard (older than 1 hour)
      const outdatedIds = Object.keys(this.cachedLeaderboard).filter(
        (id) => +id < Date.now() - 1000 * 60 * 60,
      );
      for (const id of outdatedIds) {
        delete this.cachedLeaderboard[id];
      }

      return this.latestId;
    } catch (error) {
      console.error('Error updating leaderboard cache:', error);
      return null;
    }
  }

  getLatestId(): number | null {
    return this.latestId;
  }

  getLeaderboard(query: LeaderboardQueryBody): {
    leaderboardRows: Leaderboard[];
    pagination?: {
      batchId: number;
      totalCount: number;
      size: number;
      hasMore: boolean;
    };
    error?: string;
  } {
    try {
      const batchId = query.batchId ?? this.latestId;
      if (!batchId)
        return {
          leaderboardRows: [],
          error: 'Data not available.',
        };

      const leaderboard = this.cachedLeaderboard[batchId];
      if (!leaderboard) {
        return {
          leaderboardRows: [],
          error: 'Invalid ID.',
        };
      }

      const { limit = 10, offset = 0 } = query;

      let filteredLeaderboard = leaderboard.filter((entry) => {
        const { accountValue, ...rest } = query.filter ?? {};

        if (query.query) {
          const queryLower = query.query.toLowerCase();

          // check if address matches query
          const addressMatch = entry.ethAddress
            .toLowerCase()
            .includes(queryLower);

          // check if name matches query
          const nameMatch =
            entry.displayName &&
            entry.displayName.toLowerCase().includes(queryLower);
          if (!addressMatch && !nameMatch) return false;
        }

        // for accountValue, we just need the largest "min" and smallet "max" across all time periods
        if (accountValue) {
          const min = Math.max(
            ...Object.values(accountValue).map((v) => v.min ?? 0),
          );
          const max = Math.min(
            ...Object.values(accountValue).map(
              (v) => v.max ?? 1_000_000_000_000_000_000,
            ),
          );
          if (+entry.accountValue < min || +entry.accountValue > max)
            return false;
        }

        for (const [key, value] of Object.entries(rest)) {
          if (!value) continue;
          for (const [timePeriod, minMax] of Object.entries(value)) {
            if (!minMax) continue;
            const performance = entry.windowPerformances.find(
              (w) => w[0] === timePeriod,
            );
            if (!performance) continue;
            if (minMax.min && +performance[1][key] < minMax.min) return false;
            if (minMax.max && +performance[1][key] > minMax.max) return false;
          }
        }
        return true;
      });

      const totalCount = filteredLeaderboard.length;
      // start sorting now that our dataset is smaller after filtering
      const { sort } = query;
      if (sort) {
        filteredLeaderboard = filteredLeaderboard.sort((a, b) => {
          // if sorting by accountValue, ignore time period
          if (sort.type === 'accountValue') {
            if (sort.direction === 'asc') {
              return +a.accountValue - +b.accountValue;
            } else {
              return +b.accountValue - +a.accountValue;
            }
          }
          const aValue = a.windowPerformances.find(
            (w) => w[0] === sort.timePeriod,
          )?.[1][sort.type];
          const bValue = b.windowPerformances.find(
            (w) => w[0] === sort.timePeriod,
          )?.[1][sort.type];
          if (!aValue || !bValue) return 0;
          return sort.direction === 'asc'
            ? +aValue - +bValue
            : +bValue - +aValue;
        });
      }

      // apply pagination
      filteredLeaderboard = filteredLeaderboard.slice(offset, offset + limit);

      return {
        leaderboardRows: filteredLeaderboard,
        pagination: {
          batchId,
          totalCount,
          size: filteredLeaderboard.length,
          hasMore: totalCount > offset + limit,
        },
      };
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      throw error;
    }
  }
}
