import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-2xl px-5 py-16 md:px-8 md:py-24">
      <p className="text-[12px] uppercase tracking-eyebrow text-brass">Legal</p>
      <h1 className="mt-2 font-serif text-3xl text-ink">Privacy Policy</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink/80">
        <p>
          Atelier Lume Photography ("we", "us") collects only the personal data needed to run your
          booking and communicate with you: name, email address, and phone number. When you submit an
          enquiry, we also store the event type, preferred dates, and budget you provide.
        </p>
        <p>
          We do not store payment card details. Payments are processed entirely by our payment provider
          (Stripe), which is PCI-DSS compliant; card data never reaches our servers or database.
        </p>
        <p>
          If you opt in to WhatsApp messages, we store that consent together with the timestamp it was
          given, and use it only to send booking confirmations and reminders through Twilio's WhatsApp
          Business API. You may withdraw consent at any time by replying "STOP" or contacting us.
        </p>
        <p>
          We use your data to: confirm and manage your booking, send reminders, respond to enquiries, and
          maintain records required for accounting and legal compliance. We do not sell your data.
        </p>
        <p>
          Data is retained for as long as needed to provide our services and meet legal obligations, after
          which it is deleted. You can request a copy of your data or ask us to delete it by contacting
          hello@atelierlume.com.
        </p>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </section>
  );
}
