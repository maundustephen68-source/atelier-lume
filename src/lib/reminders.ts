import { prisma } from "./prisma";
import {
  sendReminder24hClient,
  sendReminder1hClient,
  sendReminder24hOwner,
} from "./notifications";

function bookingDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`);
}

async function alreadySent(bookingId: string, messageType: string) {
  const existing = await prisma.notificationLog.findFirst({
    where: { bookingId, messageType, status: "sent" },
  });
  return Boolean(existing);
}

// Designed to be called on a schedule (every 5-15 min) by a real
// server-side scheduler - Vercel Cron hitting /api/cron/reminders, or
// `npm run cron:reminders` via system cron / a worker dyno. NEVER triggered
// by a browser timer, so it fires reliably even if nobody has the site open.
export async function runDueReminders() {
  const confirmed = await prisma.booking.findMany({
    where: { status: "confirmed" },
    select: { id: true, date: true, startTime: true },
  });

  const now = Date.now();
  const results = { checked: confirmed.length, sent: 0, errors: [] as string[] };

  for (const b of confirmed) {
    const start = bookingDateTime(b.date, b.startTime).getTime();
    const hoursUntil = (start - now) / (1000 * 60 * 60);

    // Windows are deliberately a bit wide (rather than an exact instant)
    // since the job may run every 5-15 minutes, not every second.
    const due24h = hoursUntil <= 24 && hoursUntil > 23.75;
    const due1h = hoursUntil <= 1 && hoursUntil > 0.75;

    try {
      if (due24h) {
        if (!(await alreadySent(b.id, "reminder_24h_client"))) {
          await sendReminder24hClient(b.id);
          results.sent++;
        }
        if (!(await alreadySent(b.id, "reminder_24h_owner"))) {
          await sendReminder24hOwner(b.id);
          results.sent++;
        }
      }
      if (due1h) {
        if (!(await alreadySent(b.id, "reminder_1h_client"))) {
          await sendReminder1hClient(b.id);
          results.sent++;
        }
      }
    } catch (err) {
      results.errors.push(`${b.id}: ${String(err)}`);
    }
  }

  return results;
}
