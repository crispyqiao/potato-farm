"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Potato } from "@/lib/types";

export default function Library() {
  const [potatoes, setPotatoes] = useState<Potato[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/archive")
      .then((r) => r.json())
      .then((d) => setPotatoes((d.potatoes ?? []).slice().reverse()))
      .catch(() => setPotatoes([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center" style={{ background: "var(--cream)" }}>
      <div className="w-full max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <h1 className="font-display text-5xl sm:text-6xl" style={{ color: "var(--soil-deep)", fontWeight: 700 }}>
            Potato Library
          </h1>
          <Link href="/" className="font-body text-sm px-4 py-2 rounded-full" style={{ background: "var(--cream-deep)", color: "var(--soil)" }}>
            ← back to the patch
          </Link>
        </div>
        {isLoading && <p className="font-hand text-xl text-center" style={{ color: "var(--soil)" }}>digging up old spuds...</p>}
        {!isLoading && potatoes.length === 0 && (
          <p className="font-hand text-xl text-center" style={{ color: "var(--soil)" }}>
            no archived potatoes yet — the library fills once the patch hits 12!
          </p>
        )}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
          {potatoes.map((potato) => (
            <div key={potato.id} className="flex flex-col items-center gap-1">
              <div className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: "1/1", background: "var(--cream-deep)" }}>
                <Image src={potato.drawingDataUrl} alt={potato.note ?? "a potato"} fill unoptimized className="object-contain p-2" />
              </div>
              {potato.note && <p className="font-hand text-xs text-center leading-tight" style={{ color: "var(--soil)" }}>{potato.note}</p>}
            </div>
          ))}
        </div>
      </div>
      <p className="fixed bottom-4 left-4 text-xs font-hand" style={{ color: "var(--soil)", opacity: 0.5 }}>
        vibe coded by Christy Qiao with ChatGPT &amp; Claude
      </p>
    </main>
  );
}
