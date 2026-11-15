import { auth } from '../firebase';

// Public address of the Cloudflare R2 media bucket.
export const MEDIA_PUBLIC_URL = 'https://media.lbosla.com';

export interface UploadedMedia {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

async function authHeader(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('You are signed out. Sign in again and retry.');
  return `Bearer ${await user.getIdToken()}`;
}

async function readError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.error || res.statusText;
  } catch {
    return res.statusText;
  }
}

/** Upload a file to Cloudflare R2 through /api/media. Returns its public URL. */
export async function uploadMedia(file: Blob, folder: string, fileName: string): Promise<UploadedMedia> {
  const params = new URLSearchParams({ folder, name: fileName });
  const res = await fetch(`/api/media?${params}`, {
    method: 'POST',
    headers: {
      Authorization: await authHeader(),
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

/** The R2 key for a URL we serve, or null for files hosted elsewhere (e.g. old Firebase links). */
export function mediaKeyFromUrl(url: string): string | null {
  const prefix = `${MEDIA_PUBLIC_URL}/`;
  return url.startsWith(prefix) ? decodeURIComponent(url.slice(prefix.length)) : null;
}

/** Delete a file from Cloudflare R2 by its key. */
export async function deleteMedia(key: string): Promise<void> {
  const res = await fetch(`/api/media?${new URLSearchParams({ key })}`, {
    method: 'DELETE',
    headers: { Authorization: await authHeader() },
  });
  if (!res.ok) throw new Error(await readError(res));
}
