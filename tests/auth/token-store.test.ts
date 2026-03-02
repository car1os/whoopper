import { describe, it, expect, afterEach } from 'vitest';
import { writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MemoryTokenStore, FileTokenStore } from '../../src/auth/token-store.js';
import { TokenInfo } from '../../src/auth/token-info.js';

describe('MemoryTokenStore', () => {
  it('returns null for missing key', async () => {
    const store = new MemoryTokenStore();
    expect(await store.load('missing')).toBeNull();
  });

  it('saves and loads token', async () => {
    const store = new MemoryTokenStore();
    const token = new TokenInfo({
      accessToken: 'abc',
      refreshToken: 'def',
      expiresAt: Date.now() + 3600_000,
    });

    await store.save('test', token);
    const loaded = await store.load('test');

    expect(loaded).not.toBeNull();
    expect(loaded!.accessToken).toBe('abc');
  });

  it('clears token', async () => {
    const store = new MemoryTokenStore();
    const token = new TokenInfo({
      accessToken: 'abc',
      expiresAt: Date.now() + 3600_000,
    });

    await store.save('test', token);
    await store.clear('test');

    expect(await store.load('test')).toBeNull();
  });
});

describe('FileTokenStore', () => {
  const tmpFile = join(tmpdir(), `whoopper-test-${Date.now()}.json`);

  afterEach(() => {
    if (existsSync(tmpFile)) {
      unlinkSync(tmpFile);
    }
  });

  it('returns null when file does not exist', async () => {
    const store = new FileTokenStore(tmpFile);
    expect(await store.load('missing')).toBeNull();
  });

  it('saves and loads token from file', async () => {
    const store = new FileTokenStore(tmpFile);
    const token = new TokenInfo({
      accessToken: 'file-tok',
      refreshToken: 'file-ref',
      expiresAt: 1700000000000,
    });

    await store.save('official', token);
    const loaded = await store.load('official');

    expect(loaded).not.toBeNull();
    expect(loaded!.accessToken).toBe('file-tok');
    expect(loaded!.refreshToken).toBe('file-ref');
  });

  it('clears a specific key', async () => {
    const store = new FileTokenStore(tmpFile);
    const token = new TokenInfo({
      accessToken: 'a',
      expiresAt: 1700000000000,
    });

    await store.save('key1', token);
    await store.save('key2', token);
    await store.clear('key1');

    expect(await store.load('key1')).toBeNull();
    expect(await store.load('key2')).not.toBeNull();
  });

  it('warns on loose file permissions', async () => {
    writeFileSync(tmpFile, '{}', { mode: 0o644 });
    const store = new FileTokenStore(tmpFile);
    const warns: string[] = [];
    const origWarn = console.warn;
    console.warn = (msg: string) => warns.push(msg);

    await store.load('test');

    console.warn = origWarn;
    expect(warns.length).toBe(1);
    expect(warns[0]).toContain('permissions');
  });
});
