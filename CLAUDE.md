# whoopper

The definitive WHOOP API client for Node.js. Zero runtime dependencies, full API coverage, TypeScript-first.

## Quick Reference

```bash
npm test            # vitest run
npm run test:watch  # vitest (watch mode)
npm run typecheck   # tsc --noEmit
npm run build       # tsc → dist/
```

## Project Structure

```
src/
├── client.ts                   # WhooopperClient — main entry, factory methods
├── index.ts                    # Public exports
├── auth/                       # OAuth2 flow, token management
│   ├── oauth-provider.ts       #   OAuth endpoints, browser flow, token refresh
│   ├── auth-server.ts          #   Local HTTP server for OAuth callback
│   ├── token-info.ts           #   TokenInfo class (expiry checking, 60s buffer)
│   ├── token-store.ts          #   MemoryTokenStore, FileTokenStore
│   └── types.ts                #   Auth interfaces
├── http/                       # HTTP layer
│   ├── fetch-client.ts         #   Base fetch with auth headers, error mapping
│   ├── retry.ts                #   Exponential backoff (429 + 5xx only)
│   ├── throttle.ts             #   Concurrent request limiting
│   └── errors.ts               #   HTTP status → error class mapping
├── resources/                  # API resource classes
│   ├── base.ts                 #   BaseResource, CollectionResource<T>
│   └── official/               #   WHOOP v2 API resources
│       ├── user.ts             #     getProfile(), getBodyMeasurement()
│       ├── cycle.ts            #     cycles + per-cycle recovery/sleep
│       ├── recovery.ts         #     recovery scores
│       ├── sleep.ts            #     sleep records
│       └── workout.ts          #     workouts (strain data)
├── models/                     # TypeScript interfaces for API responses
├── pagination/paginator.ts     # Cursor-based pagination (list/getAll/iterate)
├── errors/                     # WhoopError hierarchy
├── result/result.ts            # Result<T, E> type + tryCatch()
└── utils/                      # Conversion helpers (kJ→cal, ms→hrs, sleep efficiency)
tests/                          # Mirrors src/ structure
```

## Architecture

### Client Initialization

Two factory methods on `WhooopperClient`:
- `withOAuth(config)` — browser-based OAuth flow with local callback server
- `withTokens(config)` — direct initialization with existing tokens

Client exposes resources as properties: `.user`, `.cycle`, `.recovery`, `.sleep`, `.workout`

### HTTP Pipeline

Requests flow: `Resource → FetchClient → withRetry → RequestThrottler → fetch()`

- Retry: exponential backoff with jitter, only on 429 (RateLimitError) and 5xx (ServerError)
- Throttle: concurrent request limit (default 10) + minimum delay between requests
- Errors: HTTP status codes mapped to typed error classes extending `WhoopError`

### Pagination

`CollectionResource<T>` provides four patterns:
- `list(params?)` — single page
- `getAll(params?)` — all records into memory
- `iterate(params?)` — async generator (memory-efficient)
- `paginator()` — manual page-level control

All accept `{ start?, end?, limit? }` date range params.

### Token Lifecycle

- `TokenInfo.isExpired` uses a 60-second buffer before actual expiry
- `OAuthProvider` auto-refreshes expired tokens on API calls
- Token storage is pluggable via `TokenStore` interface

## Key Conventions

- **ES Modules** — `"type": "module"` in package.json; use `.js` extensions in imports
- **Zero runtime deps** — only Node.js built-ins (fetch, crypto, fs, net, http)
- **Strict TypeScript** — `noUnusedLocals`, `noUnusedParameters` enabled
- **Error hierarchy** — all errors extend `WhoopError`; use `instanceof` for typed catches
- **Result type** — `tryCatch()` wraps async calls into `Result<T>` for functional error handling
- **Testing** — Vitest with globals; mock `fetch` via `vi.stubGlobal()`; tests live in `tests/` mirroring `src/`
- **Subpath exports** — `whoopper/models`, `whoopper/errors`, `whoopper/utils` for selective imports

## WHOOP API Endpoints

- Auth: `https://api.prod.whoop.com/oauth/oauth2/auth` and `/token`
- API base: `https://api.prod.whoop.com/developer/v2`

## Environment Variables

```
WHOOP_CLIENT_ID=        # OAuth client ID
WHOOP_CLIENT_SECRET=    # OAuth client secret
WHOOP_REDIRECT_URI=     # Default: http://localhost:3000/callback
```

## CI/CD

- **ci.yml** — on push/PR to main: typecheck → test → build (Node 22)
- **publish.yml** — on `v*` tags: CI + `npm publish --provenance --access public`
