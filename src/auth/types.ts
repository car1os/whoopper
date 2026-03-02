export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
  scopes?: string[];
}

export interface InternalAuthConfig {
  cognitoClientId: string;
}

export type WhooopperConfig =
  | { mode: 'oauth'; oauth: OAuthConfig }
  | { mode: 'internal'; internal: InternalAuthConfig }
  | { mode: 'both'; oauth: OAuthConfig; internal: InternalAuthConfig }
  | { mode: 'tokens'; tokens: TokensConfig };

export interface TokensConfig {
  official?: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: number;
  };
  internal?: {
    accessToken: string;
    expiresAt?: number;
  };
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}
