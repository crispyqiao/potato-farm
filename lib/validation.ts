const DATA_URL_PREFIX = "data:image/png;base64,";
const MAX_DATA_URL_LENGTH = 400_000; // generous cap for a small canvas drawing
const MAX_NOTE_LENGTH = 40;
const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateDrawingDataUrl(value: unknown): ValidationResult {
  if (typeof value !== "string") {
    return { valid: false, error: "Drawing is missing." };
  }
  if (!value.startsWith(DATA_URL_PREFIX)) {
    return { valid: false, error: "Drawing must be a PNG image." };
  }
  if (value.length > MAX_DATA_URL_LENGTH) {
    return { valid: false, error: "Drawing is too large." };
  }
  return { valid: true };
}

export function validateSkinColor(value: unknown): ValidationResult {
  if (typeof value !== "string" || !HEX_COLOR_REGEX.test(value)) {
    return { valid: false, error: "Invalid color." };
  }
  return { valid: true };
}

export function validateNote(value: unknown): ValidationResult {
  if (value === undefined || value === null) return { valid: true };
  if (typeof value !== "string") {
    return { valid: false, error: "Note must be text." };
  }
  if (value.length > MAX_NOTE_LENGTH) {
    return { valid: false, error: `Note must be ${MAX_NOTE_LENGTH} characters or fewer.` };
  }
  return { valid: true };
}

export function sanitizeNote(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, MAX_NOTE_LENGTH);
  return trimmed.length > 0 ? trimmed : undefined;
}
