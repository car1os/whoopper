import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'node:http';

interface AuthServerResult {
  port: number;
  waitForCode: () => Promise<{ code: string; state: string }>;
  waitForTokens: () => Promise<{ accessToken: string; expiresIn: number }>;
  close: () => void;
}

const SUCCESS_HTML = `<!DOCTYPE html>
<html><head><title>Authentication Successful</title></head>
<body style="font-family:system-ui;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#0a0a0a;color:#fff">
<div style="text-align:center">
<h1 style="color:#00d1b2">Authentication Successful</h1>
<p>You can close this tab and return to the terminal.</p>
</div></body></html>`;

const LOGIN_HTML = `<!DOCTYPE html>
<html><head><title>WHOOP Login</title></head>
<body style="font-family:system-ui;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#0a0a0a;color:#fff">
<div style="max-width:400px;width:100%;padding:2rem">
<h1 style="color:#00d1b2;text-align:center">WHOOP Login</h1>
<p style="color:#999;text-align:center;font-size:0.9rem">Your password stays in this browser — it is never sent to the library.</p>
<form id="loginForm" style="display:flex;flex-direction:column;gap:1rem">
<input name="email" type="email" placeholder="Email" required style="padding:0.75rem;border:1px solid #333;border-radius:8px;background:#1a1a1a;color:#fff;font-size:1rem">
<input name="password" type="password" placeholder="Password" required style="padding:0.75rem;border:1px solid #333;border-radius:8px;background:#1a1a1a;color:#fff;font-size:1rem">
<button type="submit" style="padding:0.75rem;border:none;border-radius:8px;background:#00d1b2;color:#000;font-size:1rem;font-weight:bold;cursor:pointer">Log In</button>
<div id="error" style="color:#ff6b6b;text-align:center;display:none"></div>
</form>
</div>
<script>
const COGNITO_URL = 'https://api.prod.whoop.com/auth-service/v3/whoop';
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const errorEl = document.getElementById('error');
  errorEl.style.display = 'none';
  try {
    const resp = await fetch(COGNITO_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: form.email.value,
        password: form.password.value,
        grant_type: 'password',
        issueRefresh: false,
      }),
    });
    if (!resp.ok) throw new Error('Login failed: ' + resp.status);
    const data = await resp.json();
    await fetch('/token-callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: data.access_token,
        expires_in: data.expires_in || 3600,
      }),
    });
    document.body.innerHTML = \`${SUCCESS_HTML.replace(/`/g, '\\`').replace(/<\/?html>|<\/?head>|<\/?body>|<title>.*?<\/title>/g, '').trim()}\`;
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.style.display = 'block';
  }
});
</script></body></html>`;

export function startAuthServer(port?: number): Promise<AuthServerResult> {
  return new Promise((resolve, reject) => {
    let codeResolve: ((val: { code: string; state: string }) => void) | null = null;
    let tokenResolve: ((val: { accessToken: string; expiresIn: number }) => void) | null = null;

    const server: Server = createServer((req: IncomingMessage, res: ServerResponse) => {
      const url = new URL(req.url ?? '/', `http://localhost`);

      if (req.method === 'GET' && url.pathname === '/callback') {
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        if (code && state && codeResolve) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(SUCCESS_HTML);
          codeResolve({ code, state });
        } else {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Missing code or state parameter');
        }
        return;
      }

      if (req.method === 'GET' && url.pathname === '/login') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(LOGIN_HTML);
        return;
      }

      if (req.method === 'POST' && url.pathname === '/token-callback') {
        let body = '';
        req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        req.on('end', () => {
          try {
            const data = JSON.parse(body) as { access_token: string; expires_in: number };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
            if (tokenResolve) {
              tokenResolve({
                accessToken: data.access_token,
                expiresIn: data.expires_in,
              });
            }
          } catch {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid JSON');
          }
        });
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    });

    server.listen(port ?? 0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Failed to start auth server'));
        return;
      }
      resolve({
        port: address.port,
        waitForCode: () =>
          new Promise(res => {
            codeResolve = res;
          }),
        waitForTokens: () =>
          new Promise(res => {
            tokenResolve = res;
          }),
        close: () => server.close(),
      });
    });

    server.on('error', reject);
  });
}
