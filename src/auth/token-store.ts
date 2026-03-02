import { writeFile, readFile, chmod, stat } from 'node:fs/promises';
import { TokenInfo, type TokenInfoData } from './token-info.js';

export interface TokenStore {
  load(key: string): Promise<TokenInfo | null>;
  save(key: string, token: TokenInfo): Promise<void>;
  clear(key: string): Promise<void>;
}

export class MemoryTokenStore implements TokenStore {
  private tokens = new Map<string, TokenInfo>();

  async load(key: string): Promise<TokenInfo | null> {
    return this.tokens.get(key) ?? null;
  }

  async save(key: string, token: TokenInfo): Promise<void> {
    this.tokens.set(key, token);
  }

  async clear(key: string): Promise<void> {
    this.tokens.delete(key);
  }
}

export class FileTokenStore implements TokenStore {
  constructor(private readonly filePath: string) {}

  async load(key: string): Promise<TokenInfo | null> {
    try {
      await this.checkPermissions();
      const raw = await readFile(this.filePath, 'utf-8');
      const data = JSON.parse(raw) as Record<string, TokenInfoData>;
      const tokenData = data[key];
      if (!tokenData) return null;
      return TokenInfo.fromJSON(tokenData);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async save(key: string, token: TokenInfo): Promise<void> {
    let data: Record<string, TokenInfoData> = {};
    try {
      const raw = await readFile(this.filePath, 'utf-8');
      data = JSON.parse(raw) as Record<string, TokenInfoData>;
    } catch {
      // File doesn't exist yet, start fresh
    }
    data[key] = token.toJSON();
    await writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    await chmod(this.filePath, 0o600);
  }

  async clear(key: string): Promise<void> {
    try {
      const raw = await readFile(this.filePath, 'utf-8');
      const data = JSON.parse(raw) as Record<string, TokenInfoData>;
      delete data[key];
      await writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
      // File doesn't exist, nothing to clear
    }
  }

  private async checkPermissions(): Promise<void> {
    try {
      const stats = await stat(this.filePath);
      const mode = stats.mode & 0o777;
      if (mode !== 0o600) {
        console.warn(
          `[whoopper] Token file ${this.filePath} has permissions ${mode.toString(8)}, expected 600. ` +
          `Run: chmod 600 ${this.filePath}`,
        );
      }
    } catch {
      // File doesn't exist yet
    }
  }
}
