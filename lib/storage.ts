import { Potato } from "./types";

export const MAX_IN_PATCH = 12;
const PATCH_KEY = "potatoes";
const ARCHIVE_KEY = "potatoes_archive";

function isRedisConfigured(): boolean {
  return !!((process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL) &&
    (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN));
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
  const data = await redis.get<Potato[]>(PATCH_KEY);
  return Array.isArray(data) ? data : [];
}

async function getArchivedFromRedis(): Promise<Potato[]> {
  const redis = await getRedis();
  const data = await redis.get<Potato[]>(ARCHIVE_KEY);
  return Array.isArray(data) ? data : [];
}

async function addToRedis(potato: Potato): Promise<Potato[]> {
  const redis = await getRedis();
  const all = await getAllFromRedis();
  all.push(potato);
  let patch = all;
  let archive = await getArchivedFromRedis();
  if (all.length > MAX_IN_PATCH) {
    const overflow = all.slice(0, all.length - MAX_IN_PATCH);
    patch = all.slice(-MAX_IN_PATCH);
    archive = [...archive, ...overflow].slice(-500);
    await redis.set(ARCHIVE_KEY, archive);
  }
  await redis.set(PATCH_KEY, patch);
  return patch;
}

async function getAllFromFile(): Promise<Potato[]> {
  const { promises: fs } = await import("fs");
  const path = await import("path");
  try {
    const raw = await fs.readFile(path.join(process.cwd(), "data", "potatoes.json"), "utf-8");
    const parsed = JSON.parse(raw) as Potato[];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

async function getArchivedFromFile(): Promise<Potato[]> {
  const { promises: fs } = await import("fs");
  const path = await import("path");
  try {
    const raw = await fs.readFile(path.join(process.cwd(), "data", "archive.json"), "utf-8");
    const parsed = JSON.parse(raw) as Potato[];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

async function addToFile(potato: Potato): Promise<Potato[]> {
  const { promises: fs } = await import("fs");
  const path = await import("path");
  const DATA_DIR = path.join(process.cwd(), "data");
  await fs.mkdir(DATA_DIR, { recursive: true });
  const all = await getAllFromFile();
  all.push(potato);
  let patch = all;
  let archive = await getArchivedFromFile();
  if (all.length > MAX_IN_PATCH) {
    const overflow = all.slice(0, all.length - MAX_IN_PATCH);
    patch = all.slice(-MAX_IN_PATCH);
    archive = [...archive, ...overflow].slice(-500);
    await fs.writeFile(path.join(DATA_DIR, "archive.json"), JSON.stringify(archive), "utf-8");
  }
  await fs.writeFile(path.join(DATA_DIR, "potatoes.json"), JSON.stringify(patch), "utf-8");
  return patch;
}

export async function getAllPotatoes(): Promise<Potato[]> {
  if (isRedisConfigured()) return getAllFromRedis();
  return getAllFromFile();
}

export async function getAllArchived(): Promise<Potato[]> {
  if (isRedisConfigured()) return getArchivedFromRedis();
  return getArchivedFromFile();
}

export async function addPotato(potato: Potato): Promise<Potato[]> {
  if (isRedisConfigured()) return addToRedis(potato);
  return addToFile(potato);
}
