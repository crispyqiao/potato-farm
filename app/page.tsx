"use client";

import { useEffect, useState } from "react";
import Field from "@/components/Field";
import PlantPanel from "@/components/PlantPanel";
import { Potato } from "@/lib/types";

export default function Home() {
  const [potatoes, setPotatoes] = useState<Potato[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [panelVisible, setPanelVisible] = useState(false);

  useEffect(() => {
    fetch("/api/potatoes")
      .then((r) => r.json())
      .then((d) => setPotatoes(d.potatoes ?? []))
      .catch(() => setPotatoes([]))
      .finally(() => setIsLoading(false));
    const t = setTimeout(() => setPanelVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  function handlePlanted(potato: Potato) {
    setPotatoes((prev) => [...prev, potato]);
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "var(--cream)" }}
    >
      <div className="w-full max-w-6xl mx-auto px-6 flex flex-col items-center py-12">
        <header className="pb-8 text-center w-full">
          <h1
            className="font-display text-6xl sm:text-7xl"
            style={{ color: "var(--soil-deep)", fontWeight: 700 }}
          >
            The Potato Patch
          </h1>
        </header>

        <div className="w-full flex flex-col lg:flex-row items-center lg:items-start gap-10">
          <div className="w-full lg:flex-1">
            {isLoading ? (
              <div style={{ aspectRatio: "1264 / 848" }} />
            ) : (
              <Field potatoes={potatoes} />
            )}
            <p
              className="text-center text-sm mt-3 font-body"
              style={{ color: "var(--green-mid)" }}
            >
              {potatoes.length} potato{potatoes.length === 1 ? "" : "es"} planted so far
            </p>
          </div>

          <div
            className="w-full lg:w-64 shrink-0 lg:pt-6 transition-all duration-700"
            style={{
              opacity: panelVisible ? 1 : 0,
              transform: panelVisible ? "translateY(0)" : "translateY(16px)",
            }}
          >
            <PlantPanel onPlanted={handlePlanted} />
          </div>
        </div>

        
        <a
          href="/library"
          className="font-hand text-lg mt-10 px-6 py-3 rounded-full border-2 flex items-center gap-2 transition-transform hover:scale-105"
          style={{ borderColor: "var(--green-mid)", color: "var(--green-mid)" }}
        >
          🥔 See potato library
        </a>
      </div>

      <p
        className="fixed bottom-4 left-4 text-xs font-hand"
        style={{ color: "var(--soil)", opacity: 0.5 }}
      >
        vibe coded by Christy Qiao with ChatGPT &amp; Claude
      </p>
    </main>
  );
}
