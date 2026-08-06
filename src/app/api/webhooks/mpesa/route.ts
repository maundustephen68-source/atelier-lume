import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateHoldStillValid, SlotUnavailableError } from "@/lib/booking";
import { sendBookingConfirmationClient, sendBookingConfirmationOwner } from "@/lib/notifications";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const stkCallback = body?.Body?.stkCallback;
  if (!stkCallback) return NextResponse.json({ ResultCode: 0, ResultDesc: "Ignored" });

  const checkoutRequestId = stkCallback.CheckoutRequestID as string;
  const resultCode = stkCallback.ResultCode;

  const booking = await prisma.booking.findFirst({ where: { paymentReference: checkoutRequestId } });
  if (!booking) return NextResponse.json({ ResultCode: 0, ResultDesc: "No matching booking" });

  if (booking.status === "confirmed" && booking.paymentStatus === "paid") {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Already processed" });
  }

  if (resultCode !== 0) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "cancelled", paymentStatus: "failed" },
    });
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Payment not completed" });
  }

  try {
    await revalidateHoldStillValid(booking.id);
  } catch (err) {
    if (err instanceof SlotUnavailableError) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "cancelled", paymentStatus: "paid" },
      });
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Slot expired, needs manual refund" });
    }
    throw err;
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "confirmed", paymentStatus: "paid" },
  });

  await Promise.allSettled([
    sendBookingConfirmationClient(booking.id),
    sendBookingConfirmationOwner(booking.id),
  ]);

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
}