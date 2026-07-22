export interface Potato {
  id: string;
  drawingDataUrl: string; // PNG data URL of the user's drawing, transparent background
  skinColor: string; // hex, used as a fallback tint / accent
  plantedAt: number; // epoch ms
  x: number; // 0-1 normalized position in the field
  y: number; // 0-1 normalized position in the field
  rotation: number; // degrees, small wobble for hand-planted feel
  scale: number; // 0.85-1.15 size variance
  note?: string; // optional short note, max 40 chars
}

export interface PlantPotatoInput {
  drawingDataUrl: string;
  skinColor: string;
  note?: string;
}
