import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { queryStkStatus } from "@/lib/mpesa";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get("bookingId");
  if (!bookingId) return NextResponse.json({ error: "bookingId required" }, { status: 400 });

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (booking.status === "confirmed") {
    return NextResponse.json({ status: "confirmed" });
  }
  if (booking.status === "cancelled") {
    return NextResponse.json({
      status: booking.paymentStatus === "failed" ? "failed" : "cancelled",
    });
  }

  if (booking.paymentReference) {
    try {
      const result = await queryStkStatus(booking.paymentReference);
      if (result.paid) {
        return NextResponse.json({ status: "confirming" });
      }
    } catch {
      // still don't know - keep polling
    }
  }

  return NextResponse.json({ status: "pending" });
}