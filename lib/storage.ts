import { Potato } from "./types";

export const MAX_POTATOES = 500;
const KV_KEY = "potatoes";

function isRedisConfigured(): boolean {
  return !!(
    (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) &&
    (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN)
  );
}

async function getRedis() {
  const { Redis } = await import("@upstash/redis");
  return new Redis({
    url: (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL)!,
    token: (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN)!,
  });
}

async function getAllFromRedis(): Promise<Potato[]> {
  const redis = await getRedis();
  const data = await redis.get<Potato[]>(KV_KEY);
  return Array.isArray(data) ? data : [];
}

async function addToRedis(potato: Potato): Promise<Potato[]> {
  const all = await getAllFromRedis();
  all.push(potato);
  const trimmed = all.slice(-MAX_POTATOES);
  const redis = await getRedis();
  await redis.set(KV_KEY, trimmed);
  return trimmed;
}

async function getAllFromFile(): Promise<Potato[]> {
  const { promises: fs } = await import("fs");
  const path = await import("path");
  const DATA_FILE = path.join(process.cwd(), "data", "potatoes.json");
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Potato[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function addToFile(potato: Potato): Promise<Potato[]> {
  const { promises: fs } = await import("fs");
  const path = await import("path");
  const DATA_DIR = path.join(process.cwd(), "data");
  const DATA_FILE = path.join(DATA_DIR, "potatoes.json");
  await fs.mkdir(DATA_DIR, { recursive: true });
  const all = await getAllFromFile();
  all.push(potato);
  const trimmed = all.slice(-MAX_POTATOES);
  await fs.writeFile(DATA_FILE, JSON.stringify(trimmed), "utf-8");
  return trimmed;
}

export async function getAllPotatoes(): Promise<Potato[]> {
  if (isRedisConfigured()) return getAllFromRedis();
  return getAllFromFile();
}

export async function addPotato(potato: Potato): Promise<Potato[]> {
  if (isRedisConfigured()) return addToRedis(potato);
  return addToFile(potato);
}
