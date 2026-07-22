import { promises as fs } from "fs";
import path from "path";
import { Potato } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "potatoes.json");

// Cap the field so it never grows unbounded and stays performant.
export const MAX_POTATOES = 500;

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([]), "utf-8");
  }
}

export async function getAllPotatoes(): Promise<Potato[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  try {
    const parsed = JSON.parse(raw) as Potato[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addPotato(potato: Potato): Promise<Potato[]> {
  await ensureDataFile();
  const all = await getAllPotatoes();
  all.push(potato);
  // Keep only the most recent MAX_POTATOES so the field doesn't get overcrowded.
  const trimmed = all.slice(-MAX_POTATOES);
  await fs.writeFile(DATA_FILE, JSON.stringify(trimmed), "utf-8");
  return trimmed;
}
