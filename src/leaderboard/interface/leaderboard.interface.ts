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
