const TESTIMONIALS = [
  {
    quote:
      "Every frame felt considered. Our wedding gallery still stops us mid-scroll a year later.",
    name: "Amara & Joel",
    context: "Wedding, Karen",
  },
  {
    quote: "Booking was effortless and the reminders meant nobody on our team missed the shoot.",
    name: "Naliaka W.",
    context: "Brand campaign",
  },
  {
    quote: "Calm, precise, and unmistakably her own style. Exactly the portraits we needed.",
    name: "David K.",
    context: "Executive portraits",
  },
];

export function TestimonialStrip() {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      {TESTIMONIALS.map((t) => (
        <figure key={t.name} className="border-t border-line pt-6">
          <blockquote className="font-serif text-lg leading-snug text-ink">&ldquo;{t.quote}&rdquo;</blockquote>
          <figcaption className="mt-4 text-[12px] uppercase tracking-eyebrow text-muted">
            {t.name} — {t.context}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function TrustBadges() {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[11px] uppercase tracking-eyebrow text-muted">
      <span>Secure checkout · Stripe</span>
      <span>PCI-compliant payment</span>
      <span>4.9/5 from 120+ sessions</span>
      <span>WhatsApp &amp; email confirmations</span>
    </div>
  );
}
