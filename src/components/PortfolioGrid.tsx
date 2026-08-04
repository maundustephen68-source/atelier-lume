"use client";
import { useState } from "react";
import Image from "next/image";
import { categories, portfolioImages, PortfolioCategory } from "@/lib/portfolioData";

export function PortfolioGrid({ limit }: { limit?: number }) {
  const [active, setActive] = useState<PortfolioCategory | "all">("all");
  const images = (active === "all" ? portfolioImages : portfolioImages.filter((i) => i.category === active)).slice(
    0,
    limit
  );

  return (
    <div>
      {!limit && (
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setActive(c.value)}
              className={`border px-4 py-2 text-[12px] uppercase tracking-eyebrow transition focus-ring ${
                active === c.value
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-ink/70 hover:border-ink"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
        {images.map((img) => (
          <div key={img.id} className="group relative aspect-[3/4] overflow-hidden bg-stone">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100">
              <span className="p-3 text-[11px] uppercase tracking-eyebrow text-paper">{img.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
