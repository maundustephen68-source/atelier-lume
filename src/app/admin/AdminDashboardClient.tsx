"use client";
import { useEffect, useState } from "react";
import { useCsrf, csrfHeaders } from "@/lib/useCsrf";
import { StatusBadge } from "@/components/StatusBadge";

type Booking = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  startTime: string;
  status: string;
  paymentStatus: string;
  notes: string | null;
  service: { name: string };
  notifications: { channel: string; status: string; messageType: string }[];
};

type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  preferredDates: string;
  budget: string | null;
  status: string;
};

type Health = {
  email: { configured: boolean; lastSuccessAt: string | null };
  whatsapp: { configured: boolean; lastSuccessAt: string | null };
  recentFailures24h: { channel: string; messageType: string; sentAt: string }[];
};

const TABS = ["Overview", "Bookings", "Leads", "Blocked dates", "Delivery log"] as const;

export function AdminDashboardClient() {
  const csrf = useCsrf();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [health, setHealth] = useState<Health | null>(null);
  const [blockForm, setBlockForm] = useState({ date: "", startTime: "", endTime: "", reason: "" });
  const [blocked, setBlocked] = useState<any[]>([]);

  function loadAll() {
    fetch("/api/admin/bookings").then((r) => r.json()).then((d) => setBookings(d.bookings || []));
    fetch("/api/admin/leads").then((r) => r.json()).then((d) => setLeads(d.leads || []));
    fetch("/api/admin/health").then((r) => r.json()).then(setHealth);
    fetch("/api/admin/blocked-slots").then((r) => r.json()).then((d) => setBlocked(d.blocked || []));
  }
  useEffect(loadAll, []);

  async function updateLeadStatus(id: string, status: string) {
    await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...csrfHeaders(csrf) },
      body: JSON.stringify({ id, status }),
    });
    loadAll();
  }

  async function addBlock(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/blocked-slots", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...csrfHeaders(csrf) },
      body: JSON.stringify(blockForm),
    });
    setBlockForm({ date: "", startTime: "", endTime: "", reason: "" });
    loadAll();
  }

  async function removeBlock(id: string) {
    await fetch(`/api/admin/blocked-slots?id=${id}`, { method: "DELETE", headers: csrfHeaders(csrf) });
    loadAll();
  }

  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const newLeadsCount = leads.filter((l) => l.status === "new").length;
  const allNotifications = bookings.flatMap((b) => b.notifications);
  const failedCount = allNotifications.filter((n) => n.status === "failed").length;

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-line pb-3">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-[12px] uppercase tracking-eyebrow focus-ring ${
              tab === t ? "bg-ink text-paper" : "text-ink/70 hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <StatCard label="Confirmed bookings" value={confirmedCount} />
          <StatCard label="New leads" value={newLeadsCount} />
          <StatCard label="Failed notifications (all time)" value={failedCount} accent={failedCount > 0} />
          <StatCard
            label="Email status"
            value={health?.email.configured ? "Connected" : "Not configured"}
            small={health?.email.lastSuccessAt ? `Last sent ${new Date(health.email.lastSuccessAt).toLocaleString()}` : "No sends yet"}
          />
          <StatCard
            label="WhatsApp status"
            value={health?.whatsapp.configured ? "Connected" : "Not configured"}
            small={health?.whatsapp.lastSuccessAt ? `Last sent ${new Date(health.whatsapp.lastSuccessAt).toLocaleString()}` : "No sends yet"}
          />
        </div>
      )}

      {tab === "Bookings" && (
        <div className="mt-8">
          <div className="mb-4 flex justify-end">
            <a
              href="/api/admin/bookings?format=csv"
              className="border border-ink px-4 py-2 text-[12px] uppercase tracking-eyebrow hover:bg-ink hover:text-paper"
            >
              Export confirmed contacts (CSV)
            </a>
          </div>
          <div className="overflow-x-auto border border-line">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-stone text-[11px] uppercase tracking-eyebrow text-muted">
                <tr>
                  <th className="p-3">Client</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Date / Time</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Payment</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-t border-line">
                    <td className="p-3">
                      <p>{b.clientName}</p>
                      <p className="text-xs text-muted">{b.clientEmail} · {b.clientPhone}</p>
                    </td>
                    <td className="p-3">{b.service.name}</td>
                    <td className="p-3">{b.date} {b.startTime}</td>
                    <td className="p-3"><StatusBadge status={b.status} /></td>
                    <td className="p-3"><StatusBadge status={b.paymentStatus} /></td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr><td colSpan={5} className="p-6 text-center text-muted">No bookings yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Leads" && (
        <div className="mt-8 overflow-x-auto border border-line">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-stone text-[11px] uppercase tracking-eyebrow text-muted">
              <tr>
                <th className="p-3">Contact</th>
                <th className="p-3">Event</th>
                <th className="p-3">Preferred dates</th>
                <th className="p-3">Budget</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-t border-line">
                  <td className="p-3">
                    <p>{l.name}</p>
                    <p className="text-xs text-muted">{l.email} · {l.phone}</p>
                  </td>
                  <td className="p-3">{l.eventType}</td>
                  <td className="p-3">{l.preferredDates}</td>
                  <td className="p-3">{l.budget || "—"}</td>
                  <td className="p-3">
                    <select
                      value={l.status}
                      onChange={(e) => updateLeadStatus(l.id, e.target.value)}
                      className="border border-line bg-white px-2 py-1 text-xs"
                    >
                      {["new", "contacted", "converted", "lost"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-muted">No leads yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Blocked dates" && (
        <div className="mt-8">
          <form onSubmit={addBlock} className="mb-8 grid gap-3 border border-line bg-stone p-5 md:grid-cols-5">
            <input required type="date" value={blockForm.date} onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })} className="border border-line bg-white p-2 text-sm" />
            <input required type="time" value={blockForm.startTime} onChange={(e) => setBlockForm({ ...blockForm, startTime: e.target.value })} className="border border-line bg-white p-2 text-sm" />
            <input required type="time" value={blockForm.endTime} onChange={(e) => setBlockForm({ ...blockForm, endTime: e.target.value })} className="border border-line bg-white p-2 text-sm" />
            <input required placeholder="Reason" value={blockForm.reason} onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })} className="border border-line bg-white p-2 text-sm" />
            <button className="border border-ink bg-ink text-[12px] uppercase tracking-eyebrow text-paper">Add block</button>
          </form>
          <div className="space-y-2">
            {blocked.map((b) => (
              <div key={b.id} className="flex items-center justify-between border border-line p-3 text-sm">
                <span>{b.date} · {b.startTime}–{b.endTime} · {b.reason}</span>
                <button onClick={() => removeBlock(b.id)} className="text-danger text-[12px] uppercase tracking-eyebrow">Remove</button>
              </div>
            ))}
            {blocked.length === 0 && <p className="text-sm text-muted">No manual blocks set.</p>}
          </div>
        </div>
      )}

      {tab === "Delivery log" && (
        <div className="mt-8 overflow-x-auto border border-line">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-stone text-[11px] uppercase tracking-eyebrow text-muted">
              <tr>
                <th className="p-3">Booking</th>
                <th className="p-3">Channel</th>
                <th className="p-3">Message</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.flatMap((b) =>
                b.notifications.map((n, i) => (
                  <tr key={`${b.id}-${i}`} className="border-t border-line">
                    <td className="p-3">{b.clientName}</td>
                    <td className="p-3 capitalize">{n.channel}</td>
                    <td className="p-3">{n.messageType}</td>
                    <td className="p-3"><StatusBadge status={n.status} /></td>
                  </tr>
                ))
              )}
              {allNotifications.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center text-muted">No notifications sent yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, small, accent }: { label: string; value: string | number; small?: string; accent?: boolean }) {
  return (
    <div className="border border-line bg-stone p-5">
      <p className="text-[11px] uppercase tracking-eyebrow text-muted">{label}</p>
      <p className={`mt-2 font-serif text-2xl ${accent ? "text-danger" : "text-ink"}`}>{value}</p>
      {small && <p className="mt-1 text-xs text-muted">{small}</p>}
    </div>
  );
}
