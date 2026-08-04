import type { Metadata } from "next";
import { PortfolioGrid } from "@/components/PortfolioGrid";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Browse portrait, wedding, event, and product photography by Atelier Lume.",
};

export default function PortfolioPage() {
  return (
    <section className="mx-auto max-w-content px-5 py-16 md:px-8 md:py-24">
      <p className="text-[12px] uppercase tracking-eyebrow text-brass">Portfolio</p>
      <h1 className="mt-2 font-serif text-3xl text-ink md:text-4xl">Selected work</h1>
      <p className="mt-3 max-w-lg text-sm text-muted">
        A running collection from recent portrait, wedding, event, and product shoots.
      </p>
      <div className="mt-10">
        <PortfolioGrid />
      </div>
    </section>
  );
}
