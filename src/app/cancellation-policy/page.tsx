import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cancellation & Refund Policy" };

export default function CancellationPage() {
  return (
    <section className="mx-auto max-w-2xl px-5 py-16 md:px-8 md:py-24">
      <p className="text-[12px] uppercase tracking-eyebrow text-brass">Legal</p>
      <h1 className="mt-2 font-serif text-3xl text-ink">Cancellation &amp; Refund Policy</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink/80">
        <p>Cancellations made at least 48 hours before your session receive a full refund of any amount paid.</p>
        <p>
          Cancellations inside the 48-hour window are non-refundable, since the slot can no longer be
          offered to another client at short notice. You're welcome to contact us directly and we'll do
          our best to accommodate a reschedule where possible.
        </p>
        <p>
          If we need to cancel a session (illness, emergency, unforeseen circumstances), you'll receive a
          full refund or, if you prefer, priority rebooking at the next available date.
        </p>
        <p>Refunds are returned to your original payment method via Stripe within 5-10 business days.</p>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </section>
  );
}
