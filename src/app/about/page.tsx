import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About",
  description: "Photographer bio and credentials for Atelier Lume Photography.",
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-content px-5 py-16 md:px-8 md:py-24">
      <div className="grid gap-12 md:grid-cols-2 md:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden bg-stone">
          <Image
            src="https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=1200&auto=format&fit=crop"
            alt="Portrait of the studio's lead photographer holding a camera"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-[12px] uppercase tracking-eyebrow text-brass">About</p>
          <h1 className="mt-2 font-serif text-3xl text-ink md:text-4xl">Behind the camera</h1>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink/80">
            <p>
              Atelier Lume was founded on a simple premise: photographs should feel like memory, not
              performance. Over a decade of portrait, wedding, and editorial work across East Africa and
              beyond, the studio has developed a quiet, natural-light-led style built around unscripted
              moments.
            </p>
            <p>
              Training began in documentary photojournalism before moving into fashion and portraiture,
              and that reportage instinct still shapes every session: watch first, direct only when it
              helps, and let the light do most of the work.
            </p>
            <p>Based in Nairobi, available for travel worldwide by arrangement.</p>
          </div>
          <ul className="mt-8 space-y-2 text-sm text-muted">
            <li>— Featured in East Africa Wedding Journal, 2023 &amp; 2024</li>
            <li>— 120+ sessions delivered since 2019</li>
            <li>— Available for destination weddings and brand campaigns</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
