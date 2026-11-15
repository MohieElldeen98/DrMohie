// Cloudflare Pages Function: upload and delete admin media in the R2 bucket
// bound as MEDIA. Only signed-in Firebase users listed in ADMIN_UIDS may call it.
//
// POST   /api/media?folder=home/hero&name=photo.jpg   body = file bytes
// DELETE /api/media?key=home/hero/1700000000000_photo.jpg

interface R2BucketLike {
  put(key: string, value: ArrayBuffer, options?: unknown): Promise<unknown>;
  delete(key: string): Promise<void>;
}

interface Env {
  MEDIA: R2BucketLike;
  FIREBASE_PROJECT_ID?: string;
  ADMIN_UIDS?: string;
  MEDIA_PUBLIC_URL?: string;
}

type Ctx = { request: Request; env: Env };

const DEFAULT_PROJECT_ID = 'drmohie-538d8';
const DEFAULT_PUBLIC_URL = 'https://media.lbosla.com';
const JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = /^(image\/(jpeg|png|webp|gif|avif)|application\/pdf)$/;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

// ---------- Firebase ID token verification ----------

let jwksCache: { keys: Record<string, JsonWebKey>; expires: number } | null = null;

async function getSigningKey(kid: string): Promise<JsonWebKey | undefined> {
  if (!jwksCache || jwksCache.expires < Date.now() || !jwksCache.keys[kid]) {
    const res = await fetch(JWKS_URL);
    if (!res.ok) throw new Error('Could not fetch Firebase signing keys');
    const data = (await res.json()) as { keys: (JsonWebKey & { kid: string })[] };
    const maxAge = Number(/max-age=(\d+)/.exec(res.headers.get('Cache-Control') || '')?.[1] || 3600);
    jwksCache = {
      keys: Object.fromEntries(data.keys.map((k) => [k.kid, k])),
      expires: Date.now() + maxAge * 1000,
    };
  }
  return jwksCache.keys[kid];
}

function b64urlToBytes(s: string): Uint8Array<ArrayBuffer> {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

const b64urlToJson = (s: string) => JSON.parse(new TextDecoder().decode(b64urlToBytes(s)));

async function verifyFirebaseToken(token: string, projectId: string): Promise<{ uid: string }> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Malformed token');
  const [h, p, s] = parts;
  const header = b64urlToJson(h);
  const payload = b64urlToJson(p);
  if (header.alg !== 'RS256' || !header.kid) throw new Error('Unexpected token header');

  const jwk = await getSigningKey(header.kid);
  if (!jwk) throw new Error('Unknown signing key');
  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const ok = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    b64urlToBytes(s),
    new TextEncoder().encode(`${h}.${p}`),
  );
  if (!ok) throw new Error('Bad signature');

  const now = Math.floor(Date.now() / 1000);
  if (payload.aud !== projectId) throw new Error('Wrong audience');
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new Error('Wrong issuer');
  if (typeof payload.exp !== 'number' || payload.exp < now - 30) throw new Error('Token expired');
  if (typeof payload.iat !== 'number' || payload.iat > now + 300) throw new Error('Token issued in the future');
  if (typeof payload.sub !== 'string' || !payload.sub) throw new Error('No subject');
  return { uid: payload.sub };
}

async function requireAdmin(request: Request, env: Env): Promise<Response | null> {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return json(401, { error: 'Sign in required' });

  let uid: string;
  try {
    ({ uid } = await verifyFirebaseToken(token, env.FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID));
  } catch (e) {
    return json(401, { error: 'Invalid session', detail: (e as Error).message });
  }

  const admins = (env.ADMIN_UIDS || '').split(',').map((x) => x.trim()).filter(Boolean);
  if (!admins.includes(uid)) return json(403, { error: 'Not an admin' });
  return null;
}

// ---------- helpers ----------

function cleanFolder(folder: string | null): string | null {
  const f = (folder || 'cms').trim().replace(/^\/+|\/+$/g, '');
  if (!/^[A-Za-z0-9_-]+(\/[A-Za-z0-9_-]+)*$/.test(f)) return null;
  return f;
}

function cleanName(name: string | null, contentType: string): string {
  const raw = (name || 'file').split(/[\\/]/).pop() || 'file';
  const dot = raw.lastIndexOf('.');
  const base = (dot > 0 ? raw.slice(0, dot) : raw).replace(/[^A-Za-z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80) || 'file';
  const extFromName = dot > 0 ? raw.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  const extFromType: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
    'image/avif': 'avif', 'application/pdf': 'pdf',
  };
  const ext = extFromType[contentType] || extFromName || 'bin';
  return `${base}.${ext}`;
}

// ---------- handlers ----------

export const onRequestPost = async ({ request, env }: Ctx): Promise<Response> => {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  if (!env.MEDIA) return json(500, { error: 'MEDIA bucket is not bound' });

  const url = new URL(request.url);
  const folder = cleanFolder(url.searchParams.get('folder'));
  if (!folder) return json(400, { error: 'Bad folder' });

  const contentType = (request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
  if (!ALLOWED_TYPES.test(contentType)) return json(415, { error: `File type not allowed: ${contentType || 'unknown'}` });

  const body = await request.arrayBuffer();
  if (body.byteLength === 0) return json(400, { error: 'Empty file' });
  if (body.byteLength > MAX_BYTES) return json(413, { error: 'File is larger than 10 MB' });

  const key = `${folder}/${Date.now()}_${cleanName(url.searchParams.get('name'), contentType)}`;
  await env.MEDIA.put(key, body, {
    httpMetadata: { contentType, cacheControl: 'public, max-age=31536000, immutable' },
  });

  const base = (env.MEDIA_PUBLIC_URL || DEFAULT_PUBLIC_URL).replace(/\/+$/, '');
  return json(200, { key, url: `${base}/${key}`, size: body.byteLength, contentType });
};

export const onRequestDelete = async ({ request, env }: Ctx): Promise<Response> => {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;
  if (!env.MEDIA) return json(500, { error: 'MEDIA bucket is not bound' });

  const key = new URL(request.url).searchParams.get('key') || '';
  if (!key || key.includes('..') || key.startsWith('/')) return json(400, { error: 'Bad key' });
  await env.MEDIA.delete(key);
  return json(200, { deleted: key });
};
