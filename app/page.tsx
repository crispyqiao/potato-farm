"use client";

import { useEffect, useState } from "react";
import Field from "@/components/Field";
import PlantPanel from "@/components/PlantPanel";
import { Potato } from "@/lib/types";

export default function Home() {
  const [potatoes, setPotatoes] = useState<Potato[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/potatoes")
      .then((r) => r.json())
      .then((d) => setPotatoes(d.potatoes ?? []))
      .catch(() => setPotatoes([]))
      .finally(() => setIsLoading(false));
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

        {/* Header */}
        <header className="pb-8 text-center w-full">
          <h1
            className="font-display text-6xl sm:text-7xl"
            style={{ color: "var(--soil-deep)", fontWeight: 700 }}
          >
            The Potato Patch
          </h1>
        </header>

        {/* Field + panel side by side */}
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-start gap-10">

          {/* Field */}
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

          {/* Plant panel */}
          <div className="w-full lg:w-64 shrink-0 lg:pt-6">
            <PlantPanel onPlanted={handlePlanted} />
          </div>

        </div>
      </div>
    </main>
  );
}
