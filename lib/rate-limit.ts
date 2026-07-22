// Simple in-memory rate limit. Resets on server restart and is per-instance,
// which is fine for a small fun project. Swap for a durable store (e.g. Redis)
// if this ever runs across multiple serverless instances at scale.

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

const hits = new Map<string, number[]>();

export function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const timestamps = hits.get(identifier) ?? [];
  const recent = timestamps.filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    hits.set(identifier, recent);
    return true;
  }

  recent.push(now);
  hits.set(identifier, recent);
  return false;
}
