"use client";

import { useRef, useState } from "react";
import DrawCanvas, { DrawCanvasHandle } from "./DrawCanvas";
import { Potato } from "@/lib/types";

interface PlantPanelProps {
  onPlanted: (potato: Potato) => void;
}

const SKIN_COLORS = [
  { name: "russet", hex: "#A1683A" },
  { name: "gold", hex: "#D9A53D" },
  { name: "sweet potato", hex: "#C46B3E" },
  { name: "purple", hex: "#6B4A8A" },
  { name: "red", hex: "#A8462E" },
  { name: "fingerling", hex: "#8C7355" },
];

const MAX_NOTE_LENGTH = 40;

export default function PlantPanel({ onPlanted }: PlantPanelProps) {
  const [brushColor, setBrushColor] = useState(SKIN_COLORS[0].hex);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasHandleRef = useRef<DrawCanvasHandle | null>(null);

  async function handlePlant() {
    if (!hasDrawing || !canvasHandleRef.current) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const drawingDataUrl = canvasHandleRef.current.getDataUrl();
      const response = await fetch("/api/potatoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drawingDataUrl,
          skinColor: brushColor,
          note: note.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Couldn't plant your potato. Try again.");
      }

      const data = await response.json();
      onPlanted(data.potato as Potato);
      canvasHandleRef.current?.clear();
      setNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <p className="font-hand text-2xl mb-3" style={{ color: "var(--soil-deep)" }}>
        Add a potato to our garden?
      </p>

      <div className="flex gap-3 mb-4">
        <div className="flex flex-col gap-2">
          {SKIN_COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => setBrushColor(c.hex)}
              aria-label={`${c.name} potato`}
              className="w-7 h-7 rounded-full transition-transform shrink-0"
              style={{
                background: c.hex,
                border:
                  brushColor === c.hex
                    ? "2px solid var(--soil-deep)"
                    : "2px solid transparent",
                boxShadow: "0 0 0 1px rgba(0,0,0,0.08)",
                transform: brushColor === c.hex ? "scale(1.15)" : "scale(1)",
              }}
            />
          ))}
        </div>

        <DrawCanvas
          brushColor={brushColor}
          onChangeHasDrawing={setHasDrawing}
          size={200}
          registerHandle={(handle) => {
            canvasHandleRef.current = handle;
          }}
        />
      </div>

      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value.slice(0, MAX_NOTE_LENGTH))}
        placeholder="Add a little note (optional)"
        className="font-hand text-lg w-full mb-1 px-3 py-2 rounded-xl outline-none"
        style={{
          background: "var(--cream-deep)",
          border: "1px solid var(--tan)",
          color: "var(--soil-deep)",
        }}
      />
      <div className="flex justify-between mb-4">
        <button
          onClick={() => canvasHandleRef.current?.clear()}
          className="text-xs underline"
          style={{ color: "var(--soil)" }}
        >
          clear
        </button>
        <p className="text-xs" style={{ color: "var(--tan)" }}>
          {note.length}/{MAX_NOTE_LENGTH}
        </p>
      </div>

      {error && (
        <p className="text-sm mb-3" style={{ color: "#A8462E" }}>
          {error}
        </p>
      )}

      <button
        onClick={handlePlant}
        disabled={!hasDrawing || isSubmitting}
        className="w-full py-3 rounded-full font-display text-lg transition-opacity disabled:opacity-40"
        style={{ background: "var(--green-deep)", color: "var(--cream)" }}
      >
        {isSubmitting ? "Planting..." : "Plant"}
      </button>
    </div>
  );
}
