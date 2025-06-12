export class LeaderboardDto {
  query?: string;
  sortBy?:
    | 'pnl-asc'
    | 'pnl-desc'
    | 'return-asc'
    | 'return-desc'
    | 'volume-asc'
    | 'volume-desc'
    | 'acc-value-asc'
    | 'acc-value-desc';
  timeFrame?: '1D' | '7D' | '1M' | 'All';
  minAccountValue?: number;
  maxAccountValue?: number;
  volumeFilters?: {
    minDayVolume?: number | '';
    maxDayVolume?: number | '';
    minWeekVolume?: number | '';
    maxWeekVolume?: number | '';
    minMonthVolume?: number | '';
    maxMonthVolume?: number | '';
    minAllTimeVolume?: number | '';
    maxAllTimeVolume?: number | '';
  };
}
