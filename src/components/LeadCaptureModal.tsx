"use client";
import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

export function LeadCaptureModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);

  if (!open) return null;

  function handleFirstInput() {
    if (!started) {
      trackEvent("lead_form_started");
      setStarted(true);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      trackEvent("lead_form_submitted");
      setStatus("done");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error?.formErrors?.[0] || "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 md:items-center md:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Get in touch"
    >
      <div
        className="w-full max-w-md animate-reveal bg-paper p-7 md:p-9"
        onClick={(e) => e.stopPropagation()}
      >
        {status === "done" ? (
          <div className="text-center">
            <p className="font-serif text-2xl text-ink">Thank you.</p>
            <p className="mt-3 text-sm text-muted">
              We've received your enquiry and will reply within one business day.
            </p>
            <button onClick={onClose} className="mt-6 text-[13px] uppercase tracking-eyebrow text-brass focus-ring">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] uppercase tracking-eyebrow text-brass">Not ready to book?</p>
                <h3 className="mt-1 font-serif text-2xl text-ink">Tell us about your shoot</h3>
              </div>
              <button onClick={onClose} aria-label="Close" className="text-2xl leading-none text-ink/60 focus-ring">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3" onChange={handleFirstInput}>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
              <input required name="name" placeholder="Full name" className="input" />
              <input required type="email" name="email" placeholder="Email" className="input" />
              <input required name="phone" placeholder="Phone, e.g. +254712345678" className="input" />
              <input required name="eventType" placeholder="Event type (wedding, portrait, product...)" className="input" />
              <input required name="preferredDates" placeholder="Preferred dates" className="input" />
              <input name="budget" placeholder="Budget (optional)" className="input" />
              {error && <p className="text-sm text-danger">{error}</p>}
              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full border border-ink bg-ink py-3 text-[13px] uppercase tracking-eyebrow text-paper transition hover:bg-brass hover:border-brass disabled:opacity-60 focus-ring"
              >
                {status === "submitting" ? "Sending..." : "Send enquiry"}
              </button>
            </form>
          </>
        )}
      </div>
      <style jsx global>{`
        .input {
          width: 100%;
          border: 1px solid #ddd5c7;
          background: #fff;
          padding: 0.75rem 0.9rem;
          font-size: 0.9rem;
          color: #1c1b19;
        }
        .input:focus {
          outline: 2px solid #a6803d;
          outline-offset: 1px;
        }
      `}</style>
    </div>
  );
}
