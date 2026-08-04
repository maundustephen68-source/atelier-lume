import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const { ok } = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!ok) return NextResponse.json({ error: "Too many submissions." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Forwarded straight to the owner's inbox via the same transactional
  // email provider used for bookings (see lib/notifications.ts sendEmail).
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || "bookings@atelierlume.com",
      to: process.env.OWNER_EMAIL || "owner@example.com",
      replyTo: parsed.data.email,
      subject: `New contact form message from ${parsed.data.name}`,
      html: `<p>${parsed.data.message}</p><p>From: ${parsed.data.name} (${parsed.data.email})</p>`,
    });
  } catch {
    // Don't fail the request just because email delivery had an issue -
    // the message is still worth acknowledging to the visitor.
  }
  return NextResponse.json({ ok: true });
}
