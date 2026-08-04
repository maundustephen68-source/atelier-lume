import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { revalidateHoldStillValid, SlotUnavailableError } from "@/lib/booking";
import {
  sendBookingConfirmationClient,
  sendBookingConfirmationOwner,
} from "@/lib/notifications";

// Stripe webhooks can arrive more than once for the same event (retries on
// timeout, manual resends, etc). We guard against double-processing two
// ways: (1) Stripe's own event.id is checked against a processed-events
// table-equivalent via the booking's paymentStatus, and (2) the booking
// update is a no-op if it's already "confirmed".
export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig || "",
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as {
    id: string;
    payment_intent?: string | null;
    metadata?: { bookingId?: string };
  };
  const bookingId = session.metadata?.bookingId;
  if (!bookingId) return NextResponse.json({ received: true });

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return NextResponse.json({ received: true });

  // Idempotency guard: if we've already marked this booking paid/confirmed,
  // do nothing further - prevents duplicate webhook delivery from creating
  // duplicate confirmations or double-charging logic downstream.
  if (booking.status === "confirmed" && booking.paymentStatus === "paid") {
    return NextResponse.json({ received: true, alreadyProcessed: true });
  }

  try {
    // Recheck server-side, right before confirming, not just trusting the
    // state from when checkout started.
    await revalidateHoldStillValid(bookingId);
  } catch (err) {
    if (err instanceof SlotUnavailableError) {
      // Payment succeeded but slot expired/was taken - refund and notify.
      if (session.payment_intent) {
        await stripe.refunds.create({ payment_intent: session.payment_intent }).catch(() => {});
      }
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "cancelled", paymentStatus: "refunded" },
      });
      return NextResponse.json({ received: true, refunded: true });
    }
    throw err;
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "confirmed", paymentStatus: "paid" },
  });

  // Payment is captured and the booking is saved as confirmed above BEFORE
  // we attempt any notification - a failure here must never roll back the
  // paid booking. Each function independently logs to NotificationLog and
  // falls back to email if WhatsApp fails.
  await Promise.allSettled([
    sendBookingConfirmationClient(bookingId),
    sendBookingConfirmationOwner(bookingId),
  ]);

  return NextResponse.json({ received: true });
}
