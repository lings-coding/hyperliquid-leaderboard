type MinMax = {
  min?: number;
  max?: number;
};

export type LeaderboardFilter = Record<
  'pnl' | 'roi' | 'vlm' | 'accountValue',
  {
    day?: MinMax;
    week?: MinMax;
    month?: MinMax;
    allTime?: MinMax;
  }
>;

export type LeaderboardSort = {
  timePeriod: 'day' | 'week' | 'month' | 'allTime';
  type: 'pnl' | 'roi' | 'vlm' | 'accountValue';
  direction: 'asc' | 'desc';
};

export type LeaderboardQueryBody = {
  batchId?: number;
  filter?: LeaderboardFilter;
  limit?: number;
  offset?: number;
  orderBy?: string;
  sort?: LeaderboardSort;
};

export interface Leaderboard {
  ethAddress: `0x${string}`;
  accountValue: string;
  windowPerformances: [
    [
      'day',
      {
        pnl: string;
        roi: string;
        vlm: string;
      },
    ],
    [
      'week',
      {
        pnl: string;
        roi: string;
        vlm: string;
      },
    ],
    [
      'month',
      {
        pnl: string;
        roi: string;
        vlm: string;
      },
    ],
    [
      'allTime',
      {
        pnl: string;
        roi: string;
        vlm: string;
      },
    ],
  ];
  prize: number;
  displayName: string;
}
