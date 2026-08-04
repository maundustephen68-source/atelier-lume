import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { TrackBookingPaid } from "./TrackBookingPaid";

export const dynamic = "force-dynamic";

export default async function BookingConfirmedPage({
  searchParams,
}: {
  searchParams: { booking?: string };
}) {
  const bookingId = searchParams.booking;
  const booking = bookingId
    ? await prisma.booking.findUnique({ where: { id: bookingId }, include: { service: true } })
    : null;

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-content flex-col items-center justify-center px-5 py-20 text-center md:px-8">
      <TrackBookingPaid bookingId={booking?.id} />
      <p className="text-[12px] uppercase tracking-eyebrow text-brass">Booking confirmed</p>
      <h1 className="mt-3 max-w-lg font-serif text-3xl text-ink md:text-4xl">
        {booking ? `We can't wait to shoot with you, ${booking.clientName.split(" ")[0]}.` : "Thank you."}
      </h1>

      {booking && (
        <div className="mt-8 border border-line bg-stone px-8 py-6 text-left">
          <p className="text-sm text-muted">{booking.service.name}</p>
          <p className="mt-1 font-serif text-xl text-ink">
            {booking.date} at {booking.startTime}
          </p>
          <p className="mt-4 text-sm text-ink/80">
            A confirmation has been sent to {booking.clientEmail}
            {booking.whatsappOptIn ? " and to your WhatsApp." : "."}
          </p>
        </div>
      )}

      <p className="mt-8 max-w-md text-sm text-muted">
        You'll receive reminders 24 hours and 1 hour before your session. Need to reschedule? You can do
        that from your account up to 48 hours in advance.
      </p>

      <div className="mt-8 flex gap-4">
        <Link href="/account" className="text-[13px] uppercase tracking-eyebrow text-brass hover:underline">
          Manage my booking
        </Link>
        <Link href="/" className="text-[13px] uppercase tracking-eyebrow text-ink/70 hover:underline">
          Back home
        </Link>
      </div>
    </section>
  );
}
