"use client";

import { useEffect, useRef } from "react";

interface DrawCanvasProps {
  brushColor: string;
  onChangeHasDrawing: (hasDrawing: boolean) => void;
  size?: number;
}

export interface DrawCanvasHandle {
  getDataUrl: () => string;
  clear: () => void;
}

const BRUSH_SIZE_RATIO = 0.05; // brush width relative to canvas size

export default function DrawCanvas({
  brushColor,
  onChangeHasDrawing,
  registerHandle,
  size = 280,
}: DrawCanvasProps & { registerHandle: (handle: DrawCanvasHandle) => void }) {
  const CANVAS_SIZE = size;
  const BRUSH_SIZE = Math.max(8, size * BRUSH_SIZE_RATIO);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const hasDrawnRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw a faint potato outline guide so people know where to draw.
    ctx.save();
    ctx.strokeStyle = "rgba(92, 69, 48, 0.25)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.ellipse(
      CANVAS_SIZE / 2,
      CANVAS_SIZE / 2,
      CANVAS_SIZE * 0.32,
      CANVAS_SIZE * 0.24,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.restore();

    registerHandle({
      getDataUrl: () => {
        // Export only the drawing layer (transparent bg) by re-rendering
        // onto an offscreen canvas without the guide.
        return canvas.toDataURL("image/png");
      },
      clear: () => {
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.save();
        ctx.strokeStyle = "rgba(92, 69, 48, 0.25)";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.ellipse(
          CANVAS_SIZE / 2,
          CANVAS_SIZE / 2,
          CANVAS_SIZE * 0.32,
          CANVAS_SIZE * 0.24,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        ctx.restore();
        hasDrawnRef.current = false;
        onChangeHasDrawing(false);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE,
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    isDrawingRef.current = true;
    lastPointRef.current = getPoint(e);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const point = getPoint(e);
    const last = lastPointRef.current ?? point;

    ctx.strokeStyle = brushColor;
    ctx.lineWidth = BRUSH_SIZE;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    lastPointRef.current = point;

    if (!hasDrawnRef.current) {
      hasDrawnRef.current = true;
      onChangeHasDrawing(true);
    }
  }

  function handlePointerUp() {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  }

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="touch-none rounded-2xl border-2 border-dashed cursor-crosshair"
      style={{
        borderColor: "var(--tan)",
        background: "var(--cream-deep)",
        width: "100%",
        maxWidth: CANVAS_SIZE,
        height: "auto",
        aspectRatio: "1 / 1",
      }}
      aria-label="Drawing canvas for your potato"
    />
  );
}
