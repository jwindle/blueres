import { NodeOAuthClient, requestLocalLock } from '@atproto/oauth-client-node';
import fs from 'node:fs';
import path from 'node:path';

const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// ─── Simple file-based state/session stores ──────────────────────────────────
// Fine for a single-server or local deployment. For multi-instance production,
// replace with a Redis or database-backed store.

const DATA_DIR = path.join(process.cwd(), '.oauth-data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function fileStore(name: string) {
  const file = path.join(DATA_DIR, `${name}.json`);

  const read = (): Record<string, unknown> => {
    try {
      return JSON.parse(fs.readFileSync(file, 'utf-8'));
    } catch {
      return {};
    }
  };

  const write = (data: Record<string, unknown>) =>
    fs.writeFileSync(file, JSON.stringify(data, null, 2));

  return {
    async get(key: string) {
      return read()[key];
    },
    async set(key: string, value: unknown) {
      const data = read();
      data[key] = value;
      write(data);
    },
    async del(key: string) {
      const data = read();
      delete data[key];
      write(data);
    },
  };
}

// ─── OAuth client ─────────────────────────────────────────────────────────────

export const oauthClient = new NodeOAuthClient({
  clientMetadata: {
    client_name: 'BlueRes',
    client_id: `${APP_URL}/oauth/client-metadata`,
    client_uri: APP_URL,
    redirect_uris: [`${APP_URL}/api/oauth/callback`],
    scope: 'atproto transition:generic',
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'none',
    application_type: 'web',
    dpop_bound_access_tokens: true,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stateStore: fileStore('state') as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sessionStore: fileStore('session') as any,
  requestLock: requestLocalLock,
});
