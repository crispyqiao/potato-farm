import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addPotato, getAllPotatoes } from "@/lib/storage";
import {
  sanitizeNote,
  validateDrawingDataUrl,
  validateNote,
  validateSkinColor,
} from "@/lib/validation";
import { isRateLimited } from "@/lib/rate-limit";
import { Potato } from "@/lib/types";

export async function GET() {
  const potatoes = await getAllPotatoes();
  return NextResponse.json({ potatoes });
}

function findOpenSpot(existing: Potato[]): { x: number; y: number } {
  const MIN_DIST = 0.18;
  for (let attempt = 0; attempt < 80; attempt++) {
    const x = 0.08 + Math.random() * 0.84;
    const y = 0.08 + Math.random() * 0.84;
    const tooClose = existing.some((p) => {
      const dx = p.x - x;
      const dy = p.y - y;
      return Math.sqrt(dx * dx + dy * dy) < MIN_DIST;
    });
    if (!tooClose) return { x, y };
  }
  // fallback if field is very crowded
  return { x: 0.08 + Math.random() * 0.84, y: 0.08 + Math.random() * 0.84 };
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "You're planting too fast! Take a breather and try again in a minute." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { drawingDataUrl, skinColor, note } = (body ?? {}) as Record<string, unknown>;

  const drawingCheck = validateDrawingDataUrl(drawingDataUrl);
  if (!drawingCheck.valid) {
    return NextResponse.json({ error: drawingCheck.error }, { status: 400 });
  }

  const colorCheck = validateSkinColor(skinColor);
  if (!colorCheck.valid) {
    return NextResponse.json({ error: colorCheck.error }, { status: 400 });
  }

  const noteCheck = validateNote(note);
  if (!noteCheck.valid) {
    return NextResponse.json({ error: noteCheck.error }, { status: 400 });
  }

  const existing = await getAllPotatoes();
  const { x, y } = findOpenSpot(existing);

  const potato: Potato = {
    id: randomUUID(),
    drawingDataUrl: drawingDataUrl as string,
    skinColor: skinColor as string,
    note: sanitizeNote(note),
    plantedAt: Date.now(),
    x,
    y,
    rotation: Math.random() * 16 - 8,
    scale: 0.85 + Math.random() * 0.3,
  };

  const all = await addPotato(potato);
  return NextResponse.json({ potato, total: all.length }, { status: 201 });
}
