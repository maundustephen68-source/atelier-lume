"use client";
import { useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setStatus(res.ok ? "done" : "error");
  }

  return (
    <section className="mx-auto max-w-content px-5 py-16 md:px-8 md:py-24">
      <div className="grid gap-14 md:grid-cols-2 md:gap-20">
        <div>
          <p className="text-[12px] uppercase tracking-eyebrow text-brass">Contact</p>
          <h1 className="mt-2 font-serif text-3xl text-ink md:text-4xl">Get in touch</h1>
          <p className="mt-4 text-sm text-muted">
            For bookings, use the calendar directly — for everything else, send a note.
          </p>

          {status === "done" ? (
            <p className="mt-8 font-serif text-xl text-ink">Message sent. We'll reply within a day.</p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-3">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
              <input required name="name" placeholder="Full name" className="contact-input" />
              <input required type="email" name="email" placeholder="Email" className="contact-input" />
              <textarea required name="message" placeholder="Message" rows={5} className="contact-input" />
              <button
                type="submit"
                disabled={status === "submitting"}
                className="border border-ink bg-ink px-6 py-3 text-[13px] uppercase tracking-eyebrow text-paper transition hover:bg-brass hover:border-brass disabled:opacity-60 focus-ring"
              >
                {status === "submitting" ? "Sending..." : "Send message"}
              </button>
              {status === "error" && <p className="text-sm text-danger">Something went wrong. Please try again.</p>}
            </form>
          )}
        </div>

        <div>
          <div className="aspect-[4/3] w-full overflow-hidden border border-line">
            <iframe
              title="Studio location map"
              className="h-full w-full grayscale"
              loading="lazy"
              src="https://www.google.com/maps?q=Nairobi,Kenya&output=embed"
            />
          </div>
          <div className="mt-6 space-y-1 text-sm text-muted">
            <p>Nairobi, Kenya · sessions by appointment</p>
            <p>hello@atelierlume.com</p>
          </div>
          <div className="mt-4 flex gap-4 text-[12px] uppercase tracking-eyebrow text-brass">
            <a href="#" className="hover:underline">Instagram</a>
            <a href="#" className="hover:underline">Pinterest</a>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .contact-input {
          width: 100%;
          border: 1px solid #ddd5c7;
          background: #fff;
          padding: 0.85rem 1rem;
          font-size: 0.9rem;
        }
        .contact-input:focus {
          outline: 2px solid #a6803d;
        }
      `}</style>
    </section>
  );
}
