import type { OAuthConfig, TokensConfig } from './auth/types.js';
import { TokenInfo } from './auth/token-info.js';
import { OAuthProvider } from './auth/oauth-provider.js';
import { MemoryTokenStore, type TokenStore } from './auth/token-store.js';
import { FetchClient } from './http/fetch-client.js';
import { ConfigurationError } from './errors/config.js';
import { UserResource } from './resources/official/user.js';
import { CycleResource } from './resources/official/cycle.js';
import { RecoveryResource } from './resources/official/recovery.js';
import { SleepResource } from './resources/official/sleep.js';
import { WorkoutResource } from './resources/official/workout.js';
import type { RetryOptions } from './http/retry.js';
import type { ThrottleOptions } from './http/throttle.js';

const OFFICIAL_BASE_URL = 'https://api.prod.whoop.com/developer/v2';

export interface ClientOptions {
  tokenStore?: TokenStore;
  retry?: Partial<RetryOptions>;
  throttle?: Partial<ThrottleOptions>;
}

export class WhooopperClient {
  readonly user: UserResource;
  readonly cycle: CycleResource;
  readonly recovery: RecoveryResource;
  readonly sleep: SleepResource;
  readonly workout: WorkoutResource;

  private readonly oauthProvider: OAuthProvider | null;

  private constructor(
    oauthProvider: OAuthProvider | null,
    officialClient: FetchClient,
  ) {
    this.oauthProvider = oauthProvider;
    this.user = new UserResource(officialClient);
    this.cycle = new CycleResource(officialClient);
    this.recovery = new RecoveryResource(officialClient);
    this.sleep = new SleepResource(officialClient);
    this.workout = new WorkoutResource(officialClient);
  }

  static withOAuth(config: OAuthConfig, options?: ClientOptions): WhooopperClient {
    if (!config.clientId || !config.clientSecret) {
      throw new ConfigurationError('clientId and clientSecret are required for OAuth');
    }

    const store = options?.tokenStore ?? new MemoryTokenStore();
    const provider = new OAuthProvider(config, store);

    const client = new FetchClient({
      baseUrl: OFFICIAL_BASE_URL,
      getAccessToken: () => provider.getAccessToken(),
      retry: options?.retry,
      throttle: options?.throttle,
    });

    return new WhooopperClient(provider, client);
  }

  static withTokens(config: TokensConfig, options?: ClientOptions): WhooopperClient {
    if (!config.official) {
      throw new ConfigurationError('official token config is required');
    }

    const store = options?.tokenStore ?? new MemoryTokenStore();
    const provider = new OAuthProvider(
      { clientId: '', clientSecret: '' },
      store,
    );

    const tokenInfo = new TokenInfo({
      accessToken: config.official.accessToken,
      refreshToken: config.official.refreshToken,
      expiresAt: config.official.expiresAt ?? Date.now() + 86_400_000,
    });
    provider.setTokenInfo(tokenInfo);

    const client = new FetchClient({
      baseUrl: OFFICIAL_BASE_URL,
      getAccessToken: () => provider.getAccessToken(),
      retry: options?.retry,
      throttle: options?.throttle,
    });

    return new WhooopperClient(provider, client);
  }

  async authenticate(): Promise<void> {
    if (!this.oauthProvider) {
      throw new ConfigurationError('No auth provider configured');
    }
    await this.oauthProvider.authenticate();
  }
}
