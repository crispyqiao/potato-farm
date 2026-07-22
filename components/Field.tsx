"use client";

import Image from "next/image";
import { Potato } from "@/lib/types";

interface FieldProps {
  potatoes: Potato[];
}

// Soil region as a diamond, measured from wooden_planter_no_background.png (1264x848).
// back = far corner, left/right = side corners, front = near corner.
const SOIL = {
  back:  { x: 52.215, y: 14.151 },
  left:  { x:  9.098, y: 37.146 },
  right: { x: 90.190, y: 25.943 },
  front: { x: 48.259, y: 52.476 },
};

// Bilinear projection: u=0 left edge → u=1 right edge, v=0 back → v=1 front.
function projectToSoil(u: number, v: number) {
  const lx = SOIL.back.x + (SOIL.left.x  - SOIL.back.x) * v;
  const ly = SOIL.back.y + (SOIL.left.y  - SOIL.back.y) * v;
  const rx = SOIL.back.x + (SOIL.right.x - SOIL.back.x) * v;
  const ry = SOIL.back.y + (SOIL.right.y - SOIL.back.y) * v;
  const x = lx + (rx - lx) * u;
  const y = ly + (ry - ly) * u;
  const depthScale = 0.6 + v * 0.55;
  return { x, y, depthScale };
}

export default function Field({ potatoes }: FieldProps) {
  return (
    <div className="relative w-full" style={{ aspectRatio: "1264 / 848" }}>
      <Image
        src="/images/garden-bed.png"
        alt="A wooden raised garden bed sitting on a patch of grass"
        fill
        priority
        className="object-contain pointer-events-none select-none"
      />

      {potatoes.map((potato) => {
        // Inset slightly from edges so no potato ever clips the wood rim
        const u = 0.08 + potato.x * 0.84;
        const v = 0.08 + potato.y * 0.84;
        const { x, y, depthScale } = projectToSoil(u, v);
        const size = 7.5 * depthScale * potato.scale;

        return (
          <div
            key={potato.id}
            className="potato-mound absolute"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${size}%`,
              aspectRatio: "1 / 1",
              transform: `translate(-50%, -50%) rotate(${potato.rotation}deg)`,
              zIndex: Math.round(v * 100),
              "--rot": `${potato.rotation}deg`,
              "--delay": `${(potato.x * 3).toFixed(2)}s`,
            } as React.CSSProperties}
            title={potato.note ?? "a potato"}
          >
            <Image
              src={potato.drawingDataUrl}
              alt={potato.note ? `A potato: ${potato.note}` : "A hand-drawn potato"}
              fill
              unoptimized
              className="object-contain drop-shadow-md"
            />
            {potato.note && (
              <span
                className="font-hand absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-xs px-1.5 py-0.5 rounded"
                style={{
                  top: "100%",
                  background: "var(--cream)",
                  color: "var(--soil-deep)",
                  opacity: 0.95,
                }}
              >
                {potato.note}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
