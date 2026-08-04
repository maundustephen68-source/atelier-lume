"use client";
import { useEffect, useState } from "react";
import { useCsrf, csrfHeaders } from "@/lib/useCsrf";

type Booking = {
  id: string;
  date: string;
  startTime: string;
  status: string;
  service: { id: string; name: string; durationMinutes: number };
};

export function AccountBookingsClient() {
  const csrf = useCsrf();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newSlots, setNewSlots] = useState<string[]>([]);
  const [newTime, setNewTime] = useState("");

  function load() {
    setLoading(true);
    fetch("/api/bookings/mine")
      .then((r) => r.json())
      .then((d) => setBookings(d.bookings || []))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function cancel(bookingId: string) {
    setMessage("");
    const res = await fetch("/api/bookings/mine", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...csrfHeaders(csrf) },
      body: JSON.stringify({ bookingId, action: "cancel" }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.error || "Could not cancel.");
      return;
    }
    load();
  }

  async function loadSlotsFor(date: string, serviceId: string) {
    setNewDate(date);
    setNewTime("");
    const r = await fetch(`/api/bookings/availability?date=${date}&serviceId=${serviceId}`);
    const d = await r.json();
    setNewSlots(d.slots || []);
  }

  async function confirmReschedule(bookingId: string) {
    setMessage("");
    const res = await fetch("/api/bookings/mine", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...csrfHeaders(csrf) },
      body: JSON.stringify({ bookingId, action: "reschedule", newDate, newStartTime: newTime }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.error || "Could not reschedule.");
      return;
    }
    setReschedulingId(null);
    load();
  }

  if (loading) return <p className="text-sm text-muted">Loading your bookings…</p>;
  if (bookings.length === 0) {
    return <p className="text-sm text-muted">No upcoming bookings yet.</p>;
  }

  return (
    <div className="space-y-4">
      {message && <p className="text-sm text-danger">{message}</p>}
      {bookings.map((b) => (
        <div key={b.id} className="border border-line bg-stone p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-serif text-lg text-ink">{b.service.name}</p>
              <p className="text-sm text-muted">
                {b.date} at {b.startTime} · {b.status}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  reschedulingId === b.id ? setReschedulingId(null) : (setReschedulingId(b.id), loadSlotsFor(b.date, b.service.id))
                }
                className="text-[12px] uppercase tracking-eyebrow text-brass hover:underline"
              >
                Reschedule
              </button>
              <button
                onClick={() => cancel(b.id)}
                className="text-[12px] uppercase tracking-eyebrow text-danger hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>

          {reschedulingId === b.id && (
            <div className="mt-4 border-t border-line pt-4">
              <input
                type="date"
                value={newDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => loadSlotsFor(e.target.value, b.service.id)}
                className="border border-line bg-white px-3 py-2 text-sm"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {newSlots.map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewTime(t)}
                    className={`border px-3 py-1.5 text-sm ${newTime === t ? "border-ink bg-ink text-paper" : "border-line"}`}
                  >
                    {t}
                  </button>
                ))}
                {newDate && newSlots.length === 0 && <p className="text-sm text-muted">No availability this day.</p>}
              </div>
              <button
                onClick={() => confirmReschedule(b.id)}
                disabled={!newTime}
                className="mt-4 border border-ink bg-ink px-4 py-2 text-[12px] uppercase tracking-eyebrow text-paper disabled:opacity-50"
              >
                Confirm new time
              </button>
            </div>
          )}
        </div>
      ))}
      <p className="text-xs text-muted">
        Changes must be made at least 48 hours before your session. For reschedules, email us directly and
        we'll confirm a new slot.
      </p>
    </div>
  );
}
