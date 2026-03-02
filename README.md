# whoopper

The definitive WHOOP API client. Zero runtime dependencies. Full TypeScript types. Every endpoint.

## Install

```bash
npm install whoopper
```

Requires Node.js 18+.

## Quick Start

### With OAuth (Official API)

```typescript
import { WhooopperClient } from 'whoopper';

const client = WhooopperClient.withOAuth({
  clientId: process.env.WHOOP_CLIENT_ID!,
  clientSecret: process.env.WHOOP_CLIENT_SECRET!,
});

await client.authenticate(); // opens browser for OAuth

const profile = await client.user.getProfile();
console.log(`Hello, ${profile.first_name}!`);
```

### With Pre-existing Tokens

```typescript
const client = WhooopperClient.withTokens({
  official: {
    accessToken: 'your-access-token',
    refreshToken: 'your-refresh-token',
  },
});

const cycles = await client.cycle.getAll({ start: '2024-01-01' });
```

## Resources

All official WHOOP API v2 endpoints are supported:

```typescript
// User
await client.user.getProfile();
await client.user.getBodyMeasurement();

// Cycles
await client.cycle.list({ start: '2024-01-01', end: '2024-02-01' });
await client.cycle.getById(12345);
await client.cycle.getRecovery(12345);
await client.cycle.getSleep(12345);

// Recovery
await client.recovery.list({ start: '2024-01-01' });

// Sleep
await client.sleep.list({ start: '2024-01-01' });
await client.sleep.getById(12345);

// Workouts
await client.workout.list({ start: '2024-01-01' });
await client.workout.getById(12345);
```

## Pagination

Every collection resource supports four pagination strategies:

```typescript
// Get a single page
const page = await client.cycle.list({ start: '2024-01-01' });

// Get all records (auto-paginates)
const all = await client.cycle.getAll({ start: '2024-01-01' });

// Async iterator (memory-efficient)
for await (const cycle of client.cycle.iterate({ start: '2024-01-01' })) {
  console.log(cycle.id);
}

// Page-level iterator
for await (const page of client.cycle.paginator().iteratePages()) {
  console.log(`Got ${page.records.length} records`);
}
```

## Token Storage

By default, tokens are stored in memory. For persistence across sessions:

```typescript
import { WhooopperClient, FileTokenStore } from 'whoopper';

const client = WhooopperClient.withOAuth(
  { clientId: '...', clientSecret: '...' },
  { tokenStore: new FileTokenStore('./tokens.json') },
);
```

`FileTokenStore` writes with `0600` permissions and warns if they're looser.

You can also implement the `TokenStore` interface for custom storage (Redis, database, etc.).

## Utilities

Standalone helpers that work on plain API responses:

```typescript
import { kJToCalories, msToHours, totalSleepTime, sleepEfficiency } from 'whoopper/utils';

kJToCalories(1000);       // 239
msToHours(27_000_000);    // 7.5

// Pass a SleepScore from the API
totalSleepTime(sleep.score);    // total ms of actual sleep
sleepEfficiency(sleep.score);   // percentage
```

## Subpath Exports

```typescript
import { ... } from 'whoopper';         // everything
import { ... } from 'whoopper/models';   // type interfaces only
import { ... } from 'whoopper/errors';   // error classes only
import { ... } from 'whoopper/utils';    // utility functions only
```

## Error Handling

All errors extend `WhoopError`:

| HTTP Status | Error Class | Notes |
|-------------|-------------|-------|
| 400 | `ValidationError` | Bad request parameters |
| 401 | `TokenExpiredError` | Token needs refresh |
| 403 | `AuthenticationError` | Insufficient permissions |
| 404 | `NotFoundError` | Resource doesn't exist |
| 429 | `RateLimitError` | Has `.retryAfter` (seconds) |
| 5xx | `ServerError` | Has `.statusCode` |

Retries are automatic for 429 and 5xx (exponential backoff, respects `Retry-After` header, max 5 attempts).

### Optional Result Type

For those who prefer explicit error handling over try/catch:

```typescript
import { tryCatch } from 'whoopper';

const result = await tryCatch(() => client.user.getProfile());
if (result.ok) {
  console.log(result.value.first_name);
} else {
  console.error(result.error);
}
```

## Configuration

```typescript
WhooopperClient.withOAuth(config, {
  tokenStore: new FileTokenStore('./tokens.json'),
  retry: { maxAttempts: 3, baseDelayMs: 2000 },
  throttle: { maxConcurrent: 5, minDelayMs: 100 },
});
```

## License

MIT
