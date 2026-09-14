import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addPotato, getAllPotatoes } from "@/lib/storage";
import { sanitizeNote, validateDrawingDataUrl, validateNote, validateSkinColor } from "@/lib/validation";
import { isRateLimited } from "@/lib/rate-limit";
import { Potato } from "@/lib/types";

export async function GET() {
  const potatoes = await getAllPotatoes();
  return NextResponse.json({ potatoes });
}

// Mirrors the soil trapezoid projection in components/Field.tsx so spacing
// is checked in the same visually-projected space (the back of the box is
// narrower than the front, so raw x/y distance alone is not enough).
const SOIL = {
  back:  { x: 52.215, y: 14.151 },
  left:  { x:  9.098, y: 37.146 },
  right: { x: 90.190, y: 25.943 },
  front: { x: 48.259, y: 52.476 },
};

function projectToSoil(u: number, v: number) {
  const lx = SOIL.back.x + (SOIL.left.x - SOIL.back.x) * v;
  const ly = SOIL.back.y + (SOIL.left.y - SOIL.back.y) * v;
  const rx = SOIL.back.x + (SOIL.right.x - SOIL.back.x) * v;
  const ry = SOIL.back.y + (SOIL.right.y - SOIL.back.y) * v;
  const x = lx + (rx - lx) * u;
  const y = ly + (ry - ly) * u;
  return { x, y };
}

function projectedPosition(px: number, py: number) {
  const u = 0.08 + px * 0.84;
  const v = 0.08 + py * 0.84;
  return projectToSoil(u, v);
}

function findOpenSpot(existing: Potato[]): { x: number; y: number } {
  const MIN_DIST_PCT = 14;
  for (let attempt = 0; attempt < 120; attempt++) {
    const x = 0.12 + Math.random() * 0.76;
    const y = 0.12 + Math.random() * 0.76;
    const candidate = projectedPosition(x, y);
    const tooClose = existing.some((p) => {
      const placed = projectedPosition(p.x, p.y);
      const dx = placed.x - candidate.x;
      const dy = placed.y - candidate.y;
      return Math.sqrt(dx * dx + dy * dy) < MIN_DIST_PCT;
    });
    if (!tooClose) return { x, y };
  }
  return { x: 0.12 + Math.random() * 0.76, y: 0.12 + Math.random() * 0.76 };
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "You are planting too fast! Try again in a minute." }, { status: 429 });
  }
  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const { drawingDataUrl, skinColor, note } = (body ?? {}) as Record<string, unknown>;
  const drawingCheck = validateDrawingDataUrl(drawingDataUrl);
  if (!drawingCheck.valid) return NextResponse.json({ error: drawingCheck.error }, { status: 400 });
  const colorCheck = validateSkinColor(skinColor);
  if (!colorCheck.valid) return NextResponse.json({ error: colorCheck.error }, { status: 400 });
  const noteCheck = validateNote(note);
  if (!noteCheck.valid) return NextResponse.json({ error: noteCheck.error }, { status: 400 });
  const existing = await getAllPotatoes();
  const { x, y } = findOpenSpot(existing);
  const potato: Potato = {
    id: randomUUID(),
    drawingDataUrl: drawingDataUrl as string,
    skinColor: skinColor as string,
    note: sanitizeNote(note),
    plantedAt: Date.now(),
    x, y,
    rotation: Math.random() * 16 - 8,
    scale: 0.85 + Math.random() * 0.3,
  };
  const all = await addPotato(potato);
  return NextResponse.json({ potato, total: all.length }, { status: 201 });
}
