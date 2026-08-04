import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireClientSession, verifyCsrf } from "@/lib/auth";
import { config } from "@/lib/config";
import { getAvailableSlots, revalidateHoldStillValid, SlotUnavailableError } from "@/lib/booking";

export async function GET() {
  const session = await requireClientSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const bookings = await prisma.booking.findMany({
    where: { clientEmail: session.email, status: { in: ["confirmed", "held"] } },
    include: { service: true },
    orderBy: { date: "asc" },
  });
  return NextResponse.json({ bookings });
}

const patchSchema = z.object({
  bookingId: z.string(),
  action: z.enum(["cancel", "reschedule"]),
  newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  newStartTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

function hoursUntil(date: string, time: string) {
  return (new Date(`${date}T${time}:00`).getTime() - Date.now()) / (1000 * 60 * 60);
}

export async function PATCH(req: Request) {
  const session = await requireClientSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!(await verifyCsrf(req))) return NextResponse.json({ error: "Invalid request" }, { status: 403 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { bookingId, action, newDate, newStartTime } = parsed.data;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { service: true } });
  if (!booking || booking.clientEmail !== session.email) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (hoursUntil(booking.date, booking.startTime) < config.rescheduleCutoffHours) {
    return NextResponse.json(
      { error: `Changes must be made at least ${config.rescheduleCutoffHours}h before your session. Please contact us directly.` },
      { status: 400 }
    );
  }

  if (action === "cancel") {
    await prisma.booking.update({ where: { id: bookingId }, data: { status: "cancelled" } });
    return NextResponse.json({ ok: true });
  }

  // reschedule
  if (!newDate || !newStartTime) {
    return NextResponse.json({ error: "New date and time required" }, { status: 400 });
  }
  const slots = await getAvailableSlots(newDate, booking.service.durationMinutes);
  if (!slots.includes(newStartTime)) {
    return NextResponse.json({ error: "That slot is no longer available." }, { status: 409 });
  }

  const durationMin =
    (new Date(`2000-01-01T${booking.endTime}:00`).getTime() -
      new Date(`2000-01-01T${booking.startTime}:00`).getTime()) /
    60000;
  const newEnd = new Date(`2000-01-01T${newStartTime}:00`);
  newEnd.setMinutes(newEnd.getMinutes() + durationMin);
  const newEndTime = `${String(newEnd.getHours()).padStart(2, "0")}:${String(newEnd.getMinutes()).padStart(2, "0")}`;

  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { date: newDate, startTime: newStartTime, endTime: newEndTime },
    });
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "That slot was just taken. Please pick another." }, { status: 409 });
    }
    throw err;
  }

  return NextResponse.json({ ok: true });
}
