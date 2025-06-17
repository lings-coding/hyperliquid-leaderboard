# Hyperliquid Leaderboard Caching Service

A high-performance caching service for Hyperliquid leaderboard data, built with NestJS. This service automatically fetches and caches leaderboard data from Hyperliquid's API, providing fast access to trading performance metrics with advanced filtering and sorting capabilities.

## Features

- **Automatic Data Synchronization**: Fetches leaderboard data every 5 minutes from Hyperliquid's API
- **Intelligent Caching**: Maintains multiple versions of leaderboard data with batch IDs for data consistency
- **Advanced Filtering**: Filter by PnL, ROI, volume, and account value across different time periods
- **Flexible Sorting**: Sort by any metric (PnL, ROI, volume, account value) in ascending or descending order
- **Pagination Support**: Built-in pagination with configurable limit and offset
- **Real-time Updates**: Automatic cache refresh with fallback retry mechanism
- **Type Safety**: Full TypeScript support with comprehensive interfaces

## API Endpoints

### GET Leaderboard Data

**Endpoint:** `POST /leaderboard`

**Request Body:**

```typescript
{
  batchId?: number;           // Specific batch ID to query (optional)
  filter?: {                  // Filter criteria (optional)
    pnl?: {
      day?: { min?: number; max?: number };
      week?: { min?: number; max?: number };
      month?: { min?: number; max?: number };
      allTime?: { min?: number; max?: number };
    };
    roi?: { /* same structure as pnl */ };
    vlm?: { /* same structure as pnl */ };
    accountValue?: { /* same structure as pnl */ };
  };
  limit?: number;             // Number of results to return (default: 10)
  offset?: number;            // Number of results to skip (default: 0)
  sort?: {                    // Sorting criteria (optional)
    timePeriod: 'day' | 'week' | 'month' | 'allTime';
    type: 'pnl' | 'roi' | 'vlm' | 'accountValue';
    direction: 'asc' | 'desc';
  };
}
```

**Response:**

```typescript
{
  leaderboardRows: [
    {
      ethAddress: "0x...";
      accountValue: "1000000";
      windowPerformances: [
        ["day", { pnl: "1000", roi: "0.1", vlm: "50000" }],
        ["week", { pnl: "5000", roi: "0.5", vlm: "250000" }],
        ["month", { pnl: "15000", roi: "1.5", vlm: "750000" }],
        ["allTime", { pnl: "50000", roi: "5.0", vlm: "2500000" }]
      ];
      prize: 0;
      displayName: "Trader Name";
    }
  ];
  pagination?: {
    batchId: number;
    totalCount: number;
    size: number;
    hasMore: boolean;
  };
  error?: string;
}
```

## Usage Examples

### Basic Query

```bash
curl -X POST http://localhost:3000/leaderboard \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 20,
    "offset": 0
  }'
```

### Filtered Query

```bash
curl -X POST http://localhost:3000/leaderboard \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "pnl": {
        "day": { "min": 1000 },
        "week": { "min": 5000 }
      },
      "accountValue": {
        "allTime": { "min": 100000, "max": 10000000 }
      }
    },
    "limit": 10
  }'
```

### Sorted Query

```bash
curl -X POST http://localhost:3000/leaderboard \
  -H "Content-Type: application/json" \
  -d '{
    "sort": {
      "timePeriod": "week",
      "type": "pnl",
      "direction": "desc"
    },
    "limit": 50
  }'
```

### Complex Query with All Features

```bash
curl -X POST http://localhost:3000/leaderboard \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {
      "roi": {
        "month": { "min": 0.1, "max": 2.0 }
      },
      "vlm": {
        "allTime": { "min": 1000000 }
      }
    },
    "sort": {
      "timePeriod": "month",
      "type": "roi",
      "direction": "desc"
    },
    "limit": 25,
    "offset": 50
  }'
```

## Data Structure

### Leaderboard Entry

Each leaderboard entry contains:

- **ethAddress**: Ethereum address of the trader
- **accountValue**: Current account value in USD
- **windowPerformances**: Performance metrics across different time periods
  - **day**: 24-hour performance
  - **week**: 7-day performance
  - **month**: 30-day performance
  - **allTime**: All-time performance
- **prize**: Prize amount in USD
- **displayName**: Trader's display name

### Performance Metrics

Each time period includes:

- **pnl**: Profit and Loss in USD
- **roi**: Return on Investment as a percentage
- **vlm**: Trading volume in USD

## Configuration

The service uses the following configuration:

- **LEADERBOARD_URL**: `https://stats-data.hyperliquid.xyz/Mainnet/leaderboard`
- **REFRESH_INTERVAL**: 5 minutes (300,000 ms)
- **Retry Interval**: 5 seconds on error

## Error Handling

The service handles various error scenarios:

- **Data not available**: Returns empty results with error message when no cached data exists
- **Invalid batch ID**: Returns error when requesting non-existent batch
- **API failures**: Logs errors and continues with existing cached data
- **Network issues**: Automatic retry with exponential backoff

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Running the Service

```bash
npm run start
```

### Development Mode

```bash
npm run start:dev
```

## Architecture

The service follows a simple but effective architecture:

1. **LeaderboardService**: Core service handling data fetching and caching
2. **LeaderboardController**: REST API endpoints
3. **Automatic Sync**: Background process that fetches data every 5 minutes
4. **Batch Management**: Maintains multiple versions of data with timestamps
5. **Filtering Engine**: In-memory filtering with support for complex queries
6. **Sorting Engine**: Efficient sorting with support for multiple metrics

## Performance Considerations

- **Memory Usage**: Caches multiple batches of data (consider cleanup for long-running instances)
- **Query Performance**: Filtering and sorting happen in-memory for optimal speed
- **Network Efficiency**: Minimal API calls with intelligent caching
- **Scalability**: Stateless design allows for horizontal scaling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Add your license information here]
