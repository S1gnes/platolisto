import type { Env } from './http';

// Best-effort fallback when the rate limiting binding is missing: counts per isolate only.
const windows = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;

export function memoryLimit(key: string, limit: number, now = Date.now()): boolean {
  if (windows.size > 5000) {
    for (const [k, entry] of windows) if (entry.resetAt <= now) windows.delete(k);
  }
  const entry = windows.get(key);
  if (!entry || entry.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

export async function allowRequest(env: Env, ip: string): Promise<boolean> {
  if (env.LIMITER) {
    try {
      const { success } = await env.LIMITER.limit({ key: ip });
      return success;
    } catch {
      // Fall through to the in-memory limiter.
    }
  }
  const limit = Number(env.RATE_LIMIT_PER_MINUTE) || 30;
  return memoryLimit(ip, limit);
}
