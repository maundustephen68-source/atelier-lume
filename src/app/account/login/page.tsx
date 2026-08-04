"use client";
import { useState } from "react";

export default function AccountLoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setStatus("sent");
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-5 py-20">
      <p className="text-[12px] uppercase tracking-eyebrow text-brass">Client account</p>
      <h1 className="mt-2 font-serif text-3xl text-ink">Manage your booking</h1>

      {status === "sent" ? (
        <p className="mt-6 text-sm text-ink/80">
          If {email} has a booking with us, a sign-in link is on its way. It expires in 15 minutes.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-3">
          <input
            required
            type="email"
            placeholder="Email used for your booking"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-line bg-white px-4 py-3 text-sm focus-ring"
          />
          <button
            disabled={status === "sending"}
            className="w-full border border-ink bg-ink py-3 text-[13px] uppercase tracking-eyebrow text-paper transition hover:bg-brass hover:border-brass disabled:opacity-60 focus-ring"
          >
            {status === "sending" ? "Sending link…" : "Email me a sign-in link"}
          </button>
        </form>
      )}
    </section>
  );
}
