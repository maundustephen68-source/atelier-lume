import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/booking";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const serviceId = searchParams.get("serviceId");
  if (!date || !serviceId) {
    return NextResponse.json({ error: "date and serviceId are required" }, { status: 400 });
  }
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return NextResponse.json({ error: "Unknown service" }, { status: 404 });

  const slots = await getAvailableSlots(date, service.durationMinutes);
  return NextResponse.json({ date, slots });
}
