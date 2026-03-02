import { randomBytes } from 'node:crypto';
import type { OAuthConfig, TokenResponse } from './types.js';
import { TokenInfo } from './token-info.js';
import type { TokenStore } from './token-store.js';
import { AuthenticationError, RefreshTokenError } from '../errors/auth.js';
import { startAuthServer } from './auth-server.js';

const AUTH_URL = 'https://api.prod.whoop.com/oauth/oauth2/auth';
const TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';
const STORE_KEY = 'official';

const DEFAULT_SCOPES = [
  'read:recovery',
  'read:cycles',
  'read:sleep',
  'read:workout',
  'read:profile',
  'read:body_measurement',
];

export class OAuthProvider {
  private tokenInfo: TokenInfo | null = null;

  constructor(
    private readonly config: OAuthConfig,
    private readonly store: TokenStore,
  ) {}

  async authenticate(): Promise<TokenInfo> {
    // Try loading from store first
    const stored = await this.store.load(STORE_KEY);
    if (stored && !stored.isExpired) {
      this.tokenInfo = stored;
      return stored;
    }

    // Try refresh if we have a refresh token
    if (stored?.refreshToken) {
      try {
        return await this.refresh(stored.refreshToken);
      } catch {
        // Refresh failed, fall through to full auth
      }
    }

    // Full browser-based OAuth flow
    return this.browserAuth();
  }

  async getAccessToken(): Promise<string> {
    if (!this.tokenInfo) {
      throw new AuthenticationError('Not authenticated. Call authenticate() first.');
    }

    if (this.tokenInfo.isExpired) {
      if (this.tokenInfo.refreshToken) {
        this.tokenInfo = await this.refresh(this.tokenInfo.refreshToken);
      } else {
        throw new AuthenticationError('Token expired and no refresh token available.');
      }
    }

    return this.tokenInfo.accessToken;
  }

  setTokenInfo(tokenInfo: TokenInfo): void {
    this.tokenInfo = tokenInfo;
  }

  private async browserAuth(): Promise<TokenInfo> {
    const state = randomBytes(16).toString('hex');
    const scopes = this.config.scopes ?? DEFAULT_SCOPES;

    const configuredUri = this.config.redirectUri;
    const requestedPort = configuredUri ? new URL(configuredUri).port : undefined;
    const { port, waitForCode, close } = await startAuthServer(
      requestedPort ? Number(requestedPort) : undefined,
    );
    const redirectUri = configuredUri ?? `http://localhost:${port}/callback`;

    const authUrl = new URL(AUTH_URL);
    authUrl.searchParams.set('client_id', this.config.clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scopes.join(' '));
    authUrl.searchParams.set('state', state);

    // Open browser
    const { exec } = await import('node:child_process');
    const openCmd =
      process.platform === 'darwin'
        ? 'open'
        : process.platform === 'win32'
          ? 'start'
          : 'xdg-open';
    exec(`${openCmd} "${authUrl.toString()}"`);

    try {
      const { code, state: returnedState } = await waitForCode();

      if (returnedState !== state) {
        throw new AuthenticationError('OAuth state mismatch');
      }

      const tokenInfo = await this.exchangeCode(code, redirectUri);
      this.tokenInfo = tokenInfo;
      await this.store.save(STORE_KEY, tokenInfo);
      return tokenInfo;
    } finally {
      close();
    }
  }

  private async exchangeCode(
    code: string,
    redirectUri: string,
  ): Promise<TokenInfo> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new AuthenticationError(`Token exchange failed: ${error}`);
    }

    const tokenResponse = (await response.json()) as TokenResponse;
    return TokenInfo.fromTokenResponse(tokenResponse);
  }

  private async refresh(refreshToken: string): Promise<TokenInfo> {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new RefreshTokenError(`Token refresh failed: ${response.status}`);
    }

    const tokenResponse = (await response.json()) as TokenResponse;
    const tokenInfo = TokenInfo.fromTokenResponse(tokenResponse);
    this.tokenInfo = tokenInfo;
    await this.store.save(STORE_KEY, tokenInfo);
    return tokenInfo;
  }

  async revoke(): Promise<void> {
    await this.store.clear(STORE_KEY);
    this.tokenInfo = null;
  }
}
