// Local-disk file storage.
//
// Originally a client for the Manus WebDev "Forge" storage proxy
// (BUILT_IN_FORGE_API_URL / BUILT_IN_FORGE_API_KEY), which only exists on
// Manus's own hosting infrastructure. This standalone deployment has no
// access to that service, so uploads are written to disk instead, under
// UPLOAD_DIR (outside dist/, so `pnpm build`'s emptyOutDir doesn't wipe
// them) and served back via the /uploads static route mounted in
// server/_core/index.ts. Same function signatures as before (storagePut /
// storageGet both return { key, url }), so every caller is unchanged.

import fs from "fs/promises";
import path from "path";

export const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

function normalizeKey(relKey: string): string {
  // Strip leading slashes and resolve any ../ segments, then re-check the
  // result stays inside UPLOAD_DIR - relKey is always built server-side
  // (e.g. `service-orders/${orderId}/videos/...`), but this is cheap
  // insurance against path traversal regardless.
  const stripped = relKey.replace(/^\/+/, "");
  const resolved = path.normalize(path.join(UPLOAD_DIR, stripped));
  if (!resolved.startsWith(UPLOAD_DIR + path.sep) && resolved !== UPLOAD_DIR) {
    throw new Error("Invalid storage key");
  }
  return path.relative(UPLOAD_DIR, resolved).split(path.sep).join("/");
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  _contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const fullPath = path.join(UPLOAD_DIR, key);

  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, data as any);

  return { key, url: `/uploads/${key}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: `/uploads/${key}` };
}
