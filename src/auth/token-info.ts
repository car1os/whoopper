const EXPIRY_BUFFER_MS = 60_000;

export interface TokenInfoData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export class TokenInfo {
  readonly accessToken: string;
  readonly refreshToken: string | undefined;
  readonly expiresAt: number;

  constructor(data: TokenInfoData) {
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.expiresAt = data.expiresAt;
  }

  static fromTokenResponse(response: {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  }): TokenInfo {
    return new TokenInfo({
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresAt: Date.now() + response.expires_in * 1000,
    });
  }

  get isExpired(): boolean {
    return Date.now() >= this.expiresAt - EXPIRY_BUFFER_MS;
  }

  get timeUntilExpiry(): number {
    return Math.max(0, this.expiresAt - Date.now());
  }

  toJSON(): TokenInfoData {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      expiresAt: this.expiresAt,
    };
  }

  static fromJSON(data: TokenInfoData): TokenInfo {
    return new TokenInfo(data);
  }
}
