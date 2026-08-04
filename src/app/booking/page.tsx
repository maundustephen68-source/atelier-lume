"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCsrf, csrfHeaders } from "@/lib/useCsrf";
import { trackEvent } from "@/lib/analytics";
import { extractErrorMessage } from "@/lib/errors";

type Service = { id: string; name: string; description: string; durationMinutes: number; price: number };

export default function BookingPage() {
  const searchParams = useSearchParams();
  const csrf = useCsrf();

  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState(searchParams.get("service") || "");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [form, setForm] = useState({ clientName: "", clientEmail: "", clientPhone: "", notes: "" });
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [startedTracked, setStartedTracked] = useState(false);
  const selectedService = services.find((s) => s.id === serviceId);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((d) => {
        setServices(d.services || []);
        if (!serviceId && d.services?.[0]) setServiceId(d.services[0].id);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!date || !serviceId) return;
    setLoadingSlots(true);
    setStartTime("");
    fetch(`/api/bookings/availability?date=${date}&serviceId=${serviceId}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots || []))
      .finally(() => setLoadingSlots(false));
  }, [date, serviceId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceId || !date || !startTime) {
      setError("Please choose a package, date, and time.");
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/bookings/hold", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...csrfHeaders(csrf) },
      body: JSON.stringify({
        serviceId,
        date,
        startTime,
        whatsappOptIn,
        ...form,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(extractErrorMessage(data.error) || "That slot may have just been taken. Please pick another.");
      setSubmitting(false);
      if (res.status === 409 && date) {
        fetch(`/api/bookings/availability?date=${date}&serviceId=${serviceId}`)
          .then((r) => r.json())
          .then((d) => setSlots(d.slots || []));
      }
      return;
    }
    window.location.href = data.checkoutUrl;
  }

  return (
    <section className="mx-auto max-w-content px-5 py-16 md:px-8 md:py-24">
      <p className="text-[12px] uppercase tracking-eyebrow text-brass">Booking</p>
      <h1 className="mt-2 font-serif text-3xl text-ink md:text-4xl">Reserve your session</h1>

      <form onSubmit={handleSubmit} className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-10">
          <div>
            <label className="field-label">1. Package</label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="booking-input mt-2"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — ${s.price.toFixed(0)} ({s.durationMinutes} min)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">2. Date</label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => {
                setDate(e.target.value);
                if (!startedTracked) {
                  trackEvent("booking_started");
                  setStartedTracked(true);
                }
              }}
              className="booking-input mt-3 max-w-[220px]"
            />
          </div>

          <div>
            <label className="field-label">3. Time</label>
            {!date && <p className="mt-3 text-sm text-muted">Choose a date to see available times.</p>}
            {date && loadingSlots && <p className="mt-3 text-sm text-muted">Checking availability…</p>}
            {date && !loadingSlots && slots.length === 0 && (
              <p className="mt-3 text-sm text-muted">No availability this day — try another date.</p>
            )}
            {date && !loadingSlots && slots.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {slots.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setStartTime(t)}
                    className={`border px-4 py-2 text-sm transition focus-ring ${
                      startTime === t ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="field-label">4. Your details</label>
            <div className="mt-3 space-y-3">
              <input
                required
                placeholder="Name"
                className="booking-input"
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              />
              <input
                required
                type="email"
                placeholder="Email"
                className="booking-input"
                value={form.clientEmail}
                onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
              />
              <input
                required
                placeholder="+254712345678"
                className="booking-input"
                value={form.clientPhone}
                onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
              />
              <textarea
                placeholder="Notes (optional)"
                rows={3}
                className="booking-input"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
              <label className="flex items-start gap-3 text-sm text-ink/80">
                <input
                  type="checkbox"
                  checked={whatsappOptIn}
                  onChange={(e) => setWhatsappOptIn(e.target.checked)}
                  className="mt-1"
                />
                I agree to receive booking confirmations and reminders via WhatsApp.
              </label>
            </div>
          </div>
        </div>

        <aside className="h-fit border border-line bg-stone p-7 lg:sticky lg:top-24 lg:self-start">
          <p className="text-[12px] uppercase tracking-eyebrow text-muted">Summary</p>
          {selectedService ? (
            <>
              <p className="mt-3 font-serif text-xl text-ink">{selectedService.name}</p>
              <p className="mt-1 text-sm text-muted">{selectedService.durationMinutes} minutes</p>
              <p className="mt-4 text-sm text-ink/80">
                {date || "Select a date"} {startTime && `· ${startTime}`}
              </p>
              <p className="mt-6 font-serif text-3xl text-ink">${selectedService.price.toFixed(0)}</p>
              <p className="mt-1 text-xs text-muted">Charged securely via Stripe. No card details reach our servers.</p>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted">Loading packages…</p>
          )}

          {error && <p className="mt-4 text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full border border-ink bg-ink py-3.5 text-[13px] uppercase tracking-eyebrow text-paper transition hover:bg-brass hover:border-brass disabled:opacity-60 focus-ring"
          >
            {submitting ? "Preparing checkout…" : "Continue to payment"}
          </button>

          <div className="mt-6 space-y-1 text-[11px] uppercase tracking-eyebrow text-muted">
            <p>Secure payment · Stripe</p>
            <p>Your slot is held for 10 minutes during checkout</p>
          </div>
        </aside>
      </form>

      <style jsx global>{`
        .field-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #1c1b19;
        }
        .booking-input {
          width: 100%;
          border: 1px solid #ddd5c7;
          background: #fff;
          padding: 0.85rem 1rem;
          font-size: 0.9rem;
        }
        .booking-input:focus {
          outline: 2px solid #a6803d;
        }
      `}</style>
    </section>
  );
}