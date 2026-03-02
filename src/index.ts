// Client
export { WhooopperClient, type ClientOptions } from './client.js';

// Auth
export { TokenInfo, type TokenInfoData } from './auth/token-info.js';
export {
  type TokenStore,
  MemoryTokenStore,
  FileTokenStore,
} from './auth/token-store.js';
export { OAuthProvider } from './auth/oauth-provider.js';
export type {
  OAuthConfig,
  InternalAuthConfig,
  WhooopperConfig,
  TokensConfig,
  TokenResponse,
} from './auth/types.js';

// HTTP
export { FetchClient, type FetchClientOptions, type RequestOptions } from './http/fetch-client.js';
export { withRetry, type RetryOptions } from './http/retry.js';
export { RequestThrottler, type ThrottleOptions } from './http/throttle.js';

// Pagination
export { Paginator, type PageFetcher } from './pagination/paginator.js';

// Resources
export { UserResource } from './resources/official/user.js';
export { CycleResource } from './resources/official/cycle.js';
export { RecoveryResource } from './resources/official/recovery.js';
export { SleepResource } from './resources/official/sleep.js';
export { WorkoutResource } from './resources/official/workout.js';

// Result
export { type Result, ok, err, tryCatch } from './result/result.js';

// Models (re-export everything)
export * from './models/index.js';

// Errors (re-export everything)
export * from './errors/index.js';

// Utils (re-export everything)
export * from './utils/index.js';
