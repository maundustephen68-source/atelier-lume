import { prisma } from "./prisma";
import { config } from "./config";

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function toHHMM(mins: number) {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

// Returns free start-time slots for a given date + service duration, taking
// into account working hours, existing held/confirmed bookings, manual
// blocked-out slots, and the configurable buffer between sessions.
export async function getAvailableSlots(date: string, serviceDurationMinutes: number) {
  await releaseExpiredHolds();

  const dow = new Date(`${date}T00:00:00`).getUTCDay();
  if (!config.workingHours.daysOpen.includes(dow)) return [];

  const dayStart = toMinutes(config.workingHours.start);
  const dayEnd = toMinutes(config.workingHours.end);

  const [existing, blocked] = await Promise.all([
    prisma.booking.findMany({
      where: { date, status: { in: ["held", "confirmed"] } },
      select: { startTime: true, endTime: true },
    }),
    prisma.blockedSlot.findMany({ where: { date } }),
  ]);

  const occupied = [...existing, ...blocked].map((o) => ({
    start: toMinutes(o.startTime) - config.bufferMinutes,
    end: toMinutes(o.endTime) + config.bufferMinutes,
  }));

  const slots: string[] = [];
  const step = 30; // offer slots on a 30-min grid
  for (let start = dayStart; start + serviceDurationMinutes <= dayEnd; start += step) {
    const end = start + serviceDurationMinutes;
    const overlaps = occupied.some((o) => start < o.end && end > o.start);
    // Don't offer slots that are already in the past for today.
    const slotDateTime = new Date(`${date}T${toHHMM(start)}:00`);
    if (!overlaps && slotDateTime.getTime() > Date.now()) {
      slots.push(toHHMM(start));
    }
  }
  return slots;
}

export async function releaseExpiredHolds() {
  await prisma.booking.updateMany({
    where: { status: "held", holdExpiresAt: { lt: new Date() } },
    data: { status: "cancelled" },
  });
}

export class SlotUnavailableError extends Error {
  constructor() {
    super("This slot is no longer available. Please choose another time.");
  }
}

// Places a temporary hold on a slot for the checkout window. Wrapped in a
// transaction and relies on the DB unique constraint on (date, startTime) -
// if two requests race for the same exact slot, only one insert succeeds;
// the loser gets a unique-constraint violation which we translate into
// SlotUnavailableError. On Postgres the exclusion constraint additionally
// blocks *overlapping* (not just identical) slots - see migrations_manual/.
export async function createHold(params: {
  serviceId: string;
  date: string;
  startTime: string;
  clientEmail: string; // placeholder identity until full details are entered
  clientPhone: string;
  clientName: string;
}) {
  await releaseExpiredHolds();

  const service = await prisma.service.findUniqueOrThrow({ where: { id: params.serviceId } });
  const endTime = toHHMM(toMinutes(params.startTime) + service.durationMinutes);
  const holdExpiresAt = new Date(Date.now() + config.holdMinutes * 60 * 1000);

  try {
    return await prisma.booking.create({
      data: {
        serviceId: params.serviceId,
        date: params.date,
        startTime: params.startTime,
        endTime,
        status: "held",
        paymentStatus: "pending",
        holdExpiresAt,
        clientName: params.clientName,
        clientEmail: params.clientEmail,
        clientPhone: params.clientPhone,
      },
    });
  } catch (err: any) {
    if (err?.code === "P2002" || err?.code === "23P01") {
      throw new SlotUnavailableError();
    }
    throw err;
  }
}

// Re-checks availability server-side immediately before confirming payment -
// not just relying on the state the calendar had when it first loaded.
export async function revalidateHoldStillValid(bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new SlotUnavailableError();
  if (booking.status === "cancelled") throw new SlotUnavailableError();
  if (booking.status === "held" && booking.holdExpiresAt && booking.holdExpiresAt < new Date()) {
    await prisma.booking.update({ where: { id: bookingId }, data: { status: "cancelled" } });
    throw new SlotUnavailableError();
  }
  return booking;
}
