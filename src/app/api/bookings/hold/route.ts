import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createHold, SlotUnavailableError } from "@/lib/booking";
import { createCheckoutSession } from "@/lib/stripe";
import { phoneSchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { verifyCsrf } from "@/lib/auth";

const bodySchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  clientName: z.string().trim().min(1).max(120),
  clientEmail: z.string().trim().email(),
  clientPhone: phoneSchema,
  whatsappOptIn: z.boolean(),
  notes: z.string().trim().max(1000).optional(),
  website: z.string().max(0).optional(), // honeypot
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  const { ok } = rateLimit(`booking:${ip}`, { limit: 8, windowMs: 10 * 60 * 1000 });
  if (!ok) return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });

  if (!(await verifyCsrf(req))) {
    return NextResponse.json({ error: "Invalid request. Please refresh and try again." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;

  const service = await prisma.service.findUnique({ where: { id: data.serviceId } });
  if (!service) return NextResponse.json({ error: "Unknown package" }, { status: 404 });

  let booking;
  try {
    booking = await createHold({
      serviceId: data.serviceId,
      date: data.date,
      startTime: data.startTime,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
    });
  } catch (err) {
    if (err instanceof SlotUnavailableError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      whatsappOptIn: data.whatsappOptIn,
      whatsappOptInAt: data.whatsappOptIn ? new Date() : null,
      notes: data.notes,
    },
  });

  const site = process.env.SITE_URL || "http://localhost:3000";
  const session = await createCheckoutSession({
    bookingId: booking.id,
    amount: Math.round(service.price * 100 * (Number(process.env.DEPOSIT_PERCENT || 100) / 100)),
    serviceName: service.name,
    clientEmail: data.clientEmail,
    successUrl: `${site}/booking/confirmed?booking=${booking.id}`,
    cancelUrl: `${site}/booking?cancelled=1`,
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: { paymentReference: session.id },
  });

  return NextResponse.json({ bookingId: booking.id, checkoutUrl: session.url });
}
