import { describe, it, expect, vi, afterEach } from 'vitest';
import { TokenInfo } from '../../src/auth/token-info.js';

describe('TokenInfo', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates from constructor data', () => {
    const token = new TokenInfo({
      accessToken: 'abc',
      refreshToken: 'def',
      expiresAt: Date.now() + 3600_000,
    });

    expect(token.accessToken).toBe('abc');
    expect(token.refreshToken).toBe('def');
    expect(token.isExpired).toBe(false);
  });

  it('creates from token response', () => {
    const token = TokenInfo.fromTokenResponse({
      access_token: 'tok',
      refresh_token: 'ref',
      expires_in: 3600,
    });

    expect(token.accessToken).toBe('tok');
    expect(token.refreshToken).toBe('ref');
    expect(token.isExpired).toBe(false);
  });

  it('detects expired token with 60s buffer', () => {
    const token = new TokenInfo({
      accessToken: 'abc',
      expiresAt: Date.now() + 30_000, // 30s from now, within 60s buffer
    });

    expect(token.isExpired).toBe(true);
  });

  it('reports non-expired when well within validity', () => {
    const token = new TokenInfo({
      accessToken: 'abc',
      expiresAt: Date.now() + 120_000, // 2 min from now
    });

    expect(token.isExpired).toBe(false);
  });

  it('reports timeUntilExpiry correctly', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);

    const token = new TokenInfo({
      accessToken: 'abc',
      expiresAt: now + 5000,
    });

    expect(token.timeUntilExpiry).toBe(5000);
  });

  it('timeUntilExpiry returns 0 when expired', () => {
    const token = new TokenInfo({
      accessToken: 'abc',
      expiresAt: Date.now() - 1000,
    });

    expect(token.timeUntilExpiry).toBe(0);
  });

  it('serializes to JSON and back', () => {
    const original = new TokenInfo({
      accessToken: 'abc',
      refreshToken: 'def',
      expiresAt: 1700000000000,
    });

    const json = original.toJSON();
    const restored = TokenInfo.fromJSON(json);

    expect(restored.accessToken).toBe(original.accessToken);
    expect(restored.refreshToken).toBe(original.refreshToken);
    expect(restored.expiresAt).toBe(original.expiresAt);
  });
});
