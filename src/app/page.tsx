import Link from "next/link";
import Image from "next/image";
import { PortfolioGrid } from "@/components/PortfolioGrid";
import { TestimonialStrip, TrustBadges } from "@/components/Testimonials";

export default function HomePage() {
  return (
    <>
      {/* Hero: full-bleed shoot image, the arch is the signature motif -
          it stands in for a lens iris opening onto the work. */}
      <section className="relative h-[86vh] min-h-[560px] w-full overflow-hidden bg-ink">
        <Image
          src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1800&auto=format&fit=crop"
          alt="Bride and groom walking together through a sunlit garden aisle"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-content px-5 pb-14 md:px-8 md:pb-20">
          <p className="text-[12px] uppercase tracking-eyebrow text-paper/70">Editorial photography studio</p>
          <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-[1.05] text-paper md:text-6xl">
            Photographs that hold their light long after the day ends.
          </h1>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/booking"
              className="border border-paper bg-paper px-6 py-3 text-[13px] uppercase tracking-eyebrow text-ink transition hover:bg-brass hover:border-brass hover:text-paper focus-ring"
            >
              Book Now
            </Link>
            <Link
              href="/portfolio"
              className="border border-paper/60 px-6 py-3 text-[13px] uppercase tracking-eyebrow text-paper transition hover:border-paper focus-ring"
            >
              View Portfolio
            </Link>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-content px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <p className="text-[12px] uppercase tracking-eyebrow text-brass">The studio</p>
          <p className="font-serif text-2xl leading-snug text-ink md:text-3xl">
            Atelier Lume works in portraiture, weddings, live events, and product photography — favouring
            natural light, unposed moments, and a quiet, editorial hand.
          </p>
        </div>
      </section>

      {/* Featured portfolio strip */}
      <section className="mx-auto max-w-content px-5 pb-20 md:px-8 md:pb-28">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-serif text-2xl text-ink md:text-3xl">Selected work</h2>
          <Link href="/portfolio" className="text-[12px] uppercase tracking-eyebrow text-brass hover:underline">
            View all
          </Link>
        </div>
        <PortfolioGrid limit={6} />
      </section>

      {/* Testimonials + trust */}
      <section className="border-t border-line bg-stone">
        <div className="mx-auto max-w-content px-5 py-20 md:px-8 md:py-28">
          <h2 className="mb-10 font-serif text-2xl text-ink md:text-3xl">What clients say</h2>
          <TestimonialStrip />
          <div className="mt-14 border-t border-line pt-8">
            <TrustBadges />
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-content px-5 py-20 text-center md:px-8 md:py-28">
        <h2 className="font-serif text-3xl text-ink md:text-4xl">Ready to book your session?</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          Check live availability and secure your date in a few minutes.
        </p>
        <Link
          href="/booking"
          className="mt-8 inline-block border border-ink bg-ink px-8 py-3.5 text-[13px] uppercase tracking-eyebrow text-paper transition hover:bg-brass hover:border-brass focus-ring"
        >
          Book Now
        </Link>
      </section>
    </>
  );
}
