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

  const potato: Potato = {
    id: randomUUID(),
    drawingDataUrl: drawingDataUrl as string,
    skinColor: skinColor as string,
    note: sanitizeNote(note),
    plantedAt: Date.now(),
    x: 0.05 + Math.random() * 0.9,
    y: 0.05 + Math.random() * 0.9,
    rotation: Math.random() * 16 - 8,
    scale: 0.85 + Math.random() * 0.3,
  };

  const all = await addPotato(potato);
  return NextResponse.json({ potato, total: all.length }, { status: 201 });
}
