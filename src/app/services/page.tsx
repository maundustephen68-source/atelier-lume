import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Services & Pricing",
  description: "Photography packages for portraits, weddings, events, and product shoots.",
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });

  return (
    <section className="mx-auto max-w-content px-5 py-16 md:px-8 md:py-24">
      <p className="text-[12px] uppercase tracking-eyebrow text-brass">Services</p>
      <h1 className="mt-2 font-serif text-3xl text-ink md:text-4xl">Packages &amp; pricing</h1>
      <p className="mt-3 max-w-lg text-sm text-muted">
        Every package includes a private online gallery and full-resolution edited images.
      </p>

      <div className="mt-12 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
        {services.length === 0 && (
          <div className="col-span-full bg-paper p-10 text-center text-sm text-muted">
            No packages published yet.
          </div>
        )}
        {services.map((s: (typeof services)[number]) => (
          <div key={s.id} className="flex flex-col bg-paper p-8">
            <p className="text-[11px] uppercase tracking-eyebrow text-brass">{s.category}</p>
            <h2 className="mt-2 font-serif text-xl text-ink">{s.name}</h2>
            <p className="mt-3 flex-1 text-sm text-muted">{s.description}</p>
            <p className="mt-6 text-[12px] uppercase tracking-eyebrow text-muted">{s.durationMinutes} minutes</p>
            <p className="mt-1 font-serif text-2xl text-ink">${s.price.toFixed(0)}</p>
            <Link
              href={`/booking?service=${s.id}`}
              className="mt-6 border border-ink py-3 text-center text-[13px] uppercase tracking-eyebrow text-ink transition hover:bg-ink hover:text-paper focus-ring"
            >
              Book this package
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
