import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-2xl px-5 py-16 md:px-8 md:py-24">
      <p className="text-[12px] uppercase tracking-eyebrow text-brass">Legal</p>
      <h1 className="mt-2 font-serif text-3xl text-ink">Terms of Service</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink/80">
        <p>
          By booking a session with Atelier Lume Photography, you agree to these terms. A booking is only
          confirmed once payment has been successfully processed; until then, your selected slot is held
          temporarily and may be released if payment is not completed within the checkout window.
        </p>
        <p>
          You may reschedule or cancel your own booking from your account up to the cutoff shown at
          booking (typically 48 hours before your session). Changes requested after that window should be
          made by contacting us directly and are handled at our discretion.
        </p>
        <p>
          Edited images are delivered via a private online gallery within the timeframe stated for your
          package. Additional editing requests beyond what's included may incur an extra fee, agreed in
          advance.
        </p>
        <p>
          We are not liable for delays or inability to perform a session due to circumstances beyond our
          reasonable control (illness, extreme weather, venue access issues, etc); in such cases we will
          offer the earliest available alternative date.
        </p>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </section>
  );
}
