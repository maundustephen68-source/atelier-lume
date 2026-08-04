import { Resend } from "resend";
import twilio from "twilio";
import { prisma } from "./prisma";
import { config } from "./config";

const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const OWNER_EMAIL = process.env.OWNER_EMAIL || "owner@example.com";
const OWNER_WHATSAPP = process.env.OWNER_WHATSAPP_NUMBER || ""; // E.164
const FROM_EMAIL = process.env.FROM_EMAIL || "bookings@atelierlume.com";
const WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || ""; // e.g. whatsapp:+14155238886

type BookingWithService = Awaited<ReturnType<typeof getBookingForNotify>>;

export async function getBookingForNotify(bookingId: string) {
  return prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { service: true },
  });
}

async function log(
  bookingId: string,
  channel: "email" | "whatsapp",
  messageType: string,
  status: "sent" | "failed" | "pending",
  error?: string
) {
  await prisma.notificationLog.create({
    data: { bookingId, channel, messageType, status, error },
  });
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY not configured");
  }
  await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
}

// E.164 check - defence in depth alongside the zod schema at submission time.
export function isValidE164(phone: string) {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

// Sends via a Meta-approved WhatsApp template. In production, `templateSid`
// maps to a template configured in the Twilio Content API / Meta Business
// Manager - free-form text only works inside a customer-initiated 24h
// window, so scheduled reminders MUST use approved templates.
async function sendWhatsApp(to: string, templateSid: string, variables: Record<string, string>) {
  if (!twilioClient || !WHATSAPP_FROM) throw new Error("Twilio WhatsApp not configured");
  if (!isValidE164(to)) throw new Error("Invalid phone format for WhatsApp");
  await twilioClient.messages.create({
    from: WHATSAPP_FROM,
    to: `whatsapp:${to}`,
    contentSid: templateSid,
    contentVariables: JSON.stringify(variables),
  });
}

function fmt(b: NonNullable<BookingWithService>) {
  return {
    date: b.date,
    time: b.startTime,
    service: b.service.name,
  };
}

// Every reminder function below follows the same resilient pattern:
// 1. Try the requested channel.
// 2. Log the outcome.
// 3. If WhatsApp fails (or opt-in is false for client messages), fall back
//    to email automatically and log that fallback separately, so a
//    notification failure never blocks or rolls back the underlying booking.

async function sendClientWhatsAppOrFallbackEmail(
  booking: NonNullable<BookingWithService>,
  messageType: string,
  templateSid: string,
  variables: Record<string, string>,
  emailSubject: string,
  emailHtml: string
) {
  if (!booking.whatsappOptIn) {
    await sendEmailWithLog(booking.id, booking.clientEmail, emailSubject, emailHtml, messageType);
    return;
  }
  try {
    await sendWhatsApp(booking.clientPhone, templateSid, variables);
    await log(booking.id, "whatsapp", messageType, "sent");
  } catch (err) {
    await log(booking.id, "whatsapp", messageType, "failed", String(err));
    await sendEmailWithLog(
      booking.id,
      booking.clientEmail,
      emailSubject,
      emailHtml,
      `${messageType}_fallback`
    );
  }
}

async function sendEmailWithLog(
  bookingId: string,
  to: string,
  subject: string,
  html: string,
  messageType: string
) {
  try {
    await sendEmail(to, subject, html);
    await log(bookingId, "email", messageType, "sent");
  } catch (err) {
    await log(bookingId, "email", messageType, "failed", String(err));
  }
}

// --- Immediate confirmation (fires right after confirmed payment) ---

export async function sendBookingConfirmationClient(bookingId: string) {
  const b = await getBookingForNotify(bookingId);
  const { date, time, service } = fmt(b);
  const html = `<p>Hi ${b.clientName},</p><p>Your ${service} session is confirmed for ${date} at ${time}. We can't wait to shoot with you.</p><p>Manage or reschedule: ${process.env.SITE_URL}/account</p>`;
  await sendClientWhatsAppOrFallbackEmail(
    b,
    "booking_confirmation_client",
    process.env.TWILIO_TEMPLATE_CONFIRM_CLIENT || "",
    { "1": b.clientName, "2": service, "3": date, "4": time },
    `You're confirmed - ${service} on ${date}`,
    html
  );
}

export async function sendBookingConfirmationOwner(bookingId: string) {
  const b = await getBookingForNotify(bookingId);
  const { date, time, service } = fmt(b);
  const html = `<p>New confirmed booking:</p><ul><li>${b.clientName} (${b.clientPhone}, ${b.clientEmail})</li><li>${service} on ${date} at ${time}</li><li>Notes: ${b.notes || "-"}</li></ul>`;
  await sendEmailWithLog(b.id, OWNER_EMAIL, `New booking - ${date} ${time}`, html, "booking_confirmation_owner");
  if (OWNER_WHATSAPP) {
    try {
      await sendWhatsApp(OWNER_WHATSAPP, process.env.TWILIO_TEMPLATE_CONFIRM_OWNER || "", {
        "1": b.clientName,
        "2": b.clientPhone,
        "3": service,
        "4": `${date} ${time}`,
      });
      await log(b.id, "whatsapp", "booking_confirmation_owner", "sent");
    } catch (err) {
      await log(b.id, "whatsapp", "booking_confirmation_owner", "failed", String(err));
    }
  }
}

// --- 24h / 1h reminders (fired by the cron job, never client-side) ---

export async function sendReminder24hClient(bookingId: string) {
  const b = await getBookingForNotify(bookingId);
  const { date, time, service } = fmt(b);
  const html = `<p>Reminder: your ${service} session is tomorrow, ${date} at ${time}.</p>`;
  await sendClientWhatsAppOrFallbackEmail(
    b,
    "reminder_24h_client",
    process.env.TWILIO_TEMPLATE_REMINDER_24H || "",
    { "1": b.clientName, "2": service, "3": date, "4": time },
    `Reminder: ${service} tomorrow at ${time}`,
    html
  );
}

export async function sendReminder1hClient(bookingId: string) {
  const b = await getBookingForNotify(bookingId);
  const { time, service } = fmt(b);
  const html = `<p>See you soon! Your ${service} session starts at ${time}, in about an hour.</p>`;
  await sendClientWhatsAppOrFallbackEmail(
    b,
    "reminder_1h_client",
    process.env.TWILIO_TEMPLATE_REMINDER_1H || "",
    { "1": b.clientName, "2": service, "3": time },
    `Starting soon: ${service} at ${time}`,
    html
  );
}

export async function sendReminder24hOwner(bookingId: string) {
  const b = await getBookingForNotify(bookingId);
  const { date, time, service } = fmt(b);
  const html = `<p>Tomorrow: ${service} with ${b.clientName} (${b.clientPhone}) at ${time}. Notes: ${b.notes || "-"}</p>`;
  await sendEmailWithLog(b.id, OWNER_EMAIL, `Tomorrow: ${service} at ${time}`, html, "reminder_24h_owner");
  if (OWNER_WHATSAPP) {
    try {
      await sendWhatsApp(OWNER_WHATSAPP, process.env.TWILIO_TEMPLATE_REMINDER_24H_OWNER || "", {
        "1": b.clientName,
        "2": b.clientPhone,
        "3": service,
        "4": `${date} ${time}`,
      });
      await log(b.id, "whatsapp", "reminder_24h_owner", "sent");
    } catch (err) {
      await log(b.id, "whatsapp", "reminder_24h_owner", "failed", String(err));
    }
  }
}
