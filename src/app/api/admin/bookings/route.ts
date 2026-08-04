import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format");

  const bookings = await prisma.booking.findMany({
    where: { status: { in: ["held", "confirmed", "completed"] } },
    include: { service: true, notifications: true },
    orderBy: { date: "asc" },
  });

  if (format === "csv") {
    const header = "name,email,phone,service,date,time,status,payment_status\n";
    const rows = bookings
      .filter((b: (typeof bookings)[number]) => b.status === "confirmed" || b.status === "completed")
      .map(
        (b: (typeof bookings)[number]) =>
          `"${b.clientName}","${b.clientEmail}","${b.clientPhone}","${b.service.name}","${b.date}","${b.startTime}","${b.status}","${b.paymentStatus}"`
      )
      .join("\n");
    return new NextResponse(header + rows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=confirmed-bookings.csv",
      },
    });
  }

  return NextResponse.json({ bookings });
}
